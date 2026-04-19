(() => {
	'use strict';

	const CONFIG = {
		updateIntervalMs: 1500,
		points: 15,
		energy: {
			min: 60,
			max: 75,
			color: '#00ff88',
			label: 'Energy'
		},
		water: {
			min: 120,
			max: 150,
			color: '#3b82f6',
			label: 'Flow'
		},
		soil: {
			min: 38,
			max: 62,
			color: '#c2985b',
			label: 'Soil Moisture'
		},
		temp: {
			min: 28,
			max: 42,
			color: '#f97316',
			label: 'Temp °C'
		}
	};
	Object.freeze(CONFIG);
	Object.freeze(CONFIG.energy);
	Object.freeze(CONFIG.water);
	Object.freeze(CONFIG.soil);
	Object.freeze(CONFIG.temp);

	const state = {
		timerId: null,
		charts: {},
		isStreaming: true,
		lastTickTs: 0,
		healthScore: 98,
		anomalyScore: 0,
		samples: {
			energy: [],
			water: [],
			soil: [],
			temp: []
		}
	};

	function byId(id) {
		return document.getElementById(id);
	}

	function hasChartJs() {
		return typeof window.Chart !== 'undefined';
	}

	function hasGsap() {
		return typeof window.gsap !== 'undefined';
	}

	function readStorage(key, fallback) {
		try {
			const value = localStorage.getItem(key);
			return value == null ? fallback : value;
		} catch (_err) {
			return fallback;
		}
	}

	function writeStorage(key, value) {
		try {
			localStorage.setItem(key, value);
		} catch (_err) {
			// Ignore storage failures in restricted browser contexts.
		}
	}

	function formatNumber(value) {
		return Number(value).toFixed(1);
	}

	function randomInRange(min, max) {
		return Math.random() * (max - min) + min;
	}

	function buildSeries(min, max, count) {
		return Array(count)
			.fill(0)
			.map(() => randomInRange(min, max));
	}

	function createChart(canvasId, options) {
		const canvas = byId(canvasId);
		if (!canvas || !hasChartJs()) return null;

		return new window.Chart(canvas, {
			type: 'line',
			data: {
				labels: Array(CONFIG.points).fill(''),
				datasets: [
					{
						label: options.label,
						data: buildSeries(options.min, options.max, CONFIG.points),
						borderColor: options.color,
						backgroundColor: options.color + '22',
						tension: 0.4,
						fill: true,
						borderWidth: 3,
						pointRadius: 0
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false }
				},
				scales: {
					y: {
						display: true,
						grid: { color: 'rgba(255,255,255,0.05)' },
						ticks: { color: '#666' }
					},
					x: { display: false }
				}
			}
		});
	}

	function updateValue(id, value) {
		const element = byId(id);
		if (element) element.innerText = formatNumber(value);
	}

	function pushPoint(chart, value) {
		if (!chart) return;
		chart.data.datasets[0].data.shift();
		chart.data.datasets[0].data.push(value);
		chart.update('none');
	}

	function updateTelemetryBadge(mode) {
		const pill = byId('telemetry-pill');
		const text = byId('telemetry-status-text');
		if (!pill || !text) return;

		pill.classList.remove('is-paused', 'is-alert');

		if (mode === 'paused') {
			pill.classList.add('is-paused');
			text.textContent = 'STREAM PAUSED';
			return;
		}

		if (mode === 'alert') {
			pill.classList.add('is-alert');
			text.textContent = 'ANOMALY WATCH';
			return;
		}

		text.textContent = 'SIMULATION LIVE';
	}

	// Anomaly score thresholds — mirror the firmware heuristic in IoT_THING_SPEAK.md.
	// Power threshold is in kW (CSP aggregate) whereas firmware uses W (individual panel).
	const ANOMALY = Object.freeze({
		soilLow:         30,   soilLowPenalty:  1.2,
		soilHigh:        70,   soilHighPenalty: 0.8,
		powerLowKw:      61,   powerLowPenalty: 15,
		tempHigh:        45,   tempHighPenalty: 2,
		tempLow:          5,   tempLowPenalty:  3
	});

	/**
	 * Compute an edge-side anomaly score (0–100).
	 * Heuristic mirrors the firmware logic in IoT_THING_SPEAK.md.
	 * Note: powerW here is the CSP aggregate output in kW (60–75 kW range),
	 * whereas the firmware measures individual panel output in Watts; thresholds
	 * are scaled accordingly.
	 */
	function computeAnomalyScore(powerW, soilPct, tempC) {
		let score = 0;
		if (soilPct < ANOMALY.soilLow)  score += (ANOMALY.soilLow  - soilPct) * ANOMALY.soilLowPenalty;
		if (soilPct > ANOMALY.soilHigh) score += (soilPct - ANOMALY.soilHigh) * ANOMALY.soilHighPenalty;
		if (powerW  < ANOMALY.powerLowKw) score += ANOMALY.powerLowPenalty;
		if (tempC   > ANOMALY.tempHigh) score += (tempC   - ANOMALY.tempHigh) * ANOMALY.tempHighPenalty;
		if (tempC   < ANOMALY.tempLow)  score += (ANOMALY.tempLow  - tempC)   * ANOMALY.tempLowPenalty;
		return Math.min(Math.max(score, 0), 100);
	}

	function updateOpsUI(powerValue, flowValue, soilValue, tempValue, latency) {
		const qualityEl = byId('ops-quality');
		const latencyEl = byId('ops-latency');
		const modeEl = byId('ops-mode');
		const anomalyEl = byId('ops-anomaly');

		state.samples.energy.push(powerValue);
		state.samples.water.push(flowValue);
		state.samples.soil.push(soilValue);
		state.samples.temp.push(tempValue);
		if (state.samples.energy.length > 8) state.samples.energy.shift();
		if (state.samples.water.length > 8) state.samples.water.shift();
		if (state.samples.soil.length > 8) state.samples.soil.shift();
		if (state.samples.temp.length > 8) state.samples.temp.shift();

		const outOfBand = powerValue < 61 || powerValue > 74 || flowValue < 122 || flowValue > 148;
		state.healthScore = Math.max(85, Math.min(99.8, state.healthScore + (outOfBand ? -0.9 : 0.35)));

		const rawAnomaly = computeAnomalyScore(powerValue, soilValue, tempValue);
		// Exponential smoothing (α = 0.3) to reduce jitter
		state.anomalyScore = 0.3 * rawAnomaly + 0.7 * state.anomalyScore;

		if (qualityEl) qualityEl.textContent = formatNumber(state.healthScore);
		if (latencyEl) latencyEl.textContent = String(Math.max(1, Math.round(latency)));
		if (modeEl) modeEl.textContent = outOfBand ? 'SIMULATION / WATCH' : 'SIMULATION / STABLE';
		if (anomalyEl) anomalyEl.textContent = formatNumber(state.anomalyScore);

		updateTelemetryBadge(outOfBand ? 'alert' : 'live');
	}

	function setStreamingState(nextState) {
		state.isStreaming = nextState;
		const toggle = byId('stream-toggle');
		if (!toggle) return;

		toggle.textContent = nextState ? 'إيقاف البث' : 'استئناف البث';
		if (!nextState) {
			updateTelemetryBadge('paused');
			const modeEl = byId('ops-mode');
			if (modeEl) modeEl.textContent = 'PAUSED / MANUAL HOLD';
		}
	}

	function startTelemetry() {
		if (!state.charts.energy && !state.charts.water) return;

		if (state.timerId) {
			window.clearInterval(state.timerId);
		}

		state.lastTickTs = performance.now();

		state.timerId = window.setInterval(() => {
			if (!state.isStreaming) return;

			const now = performance.now();
			const latency = now - state.lastTickTs;
			state.lastTickTs = now;

			const powerValue = randomInRange(CONFIG.energy.min, CONFIG.energy.max);
			const flowValue  = randomInRange(CONFIG.water.min, CONFIG.water.max);
			const soilValue  = randomInRange(CONFIG.soil.min, CONFIG.soil.max);
			const tempValue  = randomInRange(CONFIG.temp.min, CONFIG.temp.max);

			updateValue('val-pwr', powerValue);
			updateValue('val-flow', flowValue);
			updateValue('val-soil', soilValue);
			updateValue('val-temp', tempValue);

			pushPoint(state.charts.energy, powerValue);
			pushPoint(state.charts.water, flowValue);
			pushPoint(state.charts.soil, soilValue);
			pushPoint(state.charts.temp, tempValue);
			updateOpsUI(powerValue, flowValue, soilValue, tempValue, latency);
		}, CONFIG.updateIntervalMs);
	}

	function setupStreamToggle() {
		const toggle = byId('stream-toggle');
		if (!toggle) return;

		toggle.addEventListener('click', () => {
			setStreamingState(!state.isStreaming);
		});
	}

	function setupSmoothAnchors() {
		const anchors = document.querySelectorAll('a[href^="#"]');
		anchors.forEach((anchor) => {
			anchor.addEventListener('click', (event) => {
				const href = anchor.getAttribute('href');
				if (!href || href === '#') return;

				const target = document.querySelector(href);
				if (!target) return;

				event.preventDefault();
				target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			});
		});
	}

	function secureExternalLinks() {
		const links = document.querySelectorAll('a[target="_blank"]');
		links.forEach((link) => {
			const rel = (link.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
			if (!rel.includes('noopener')) rel.push('noopener');
			if (!rel.includes('noreferrer')) rel.push('noreferrer');
			link.setAttribute('rel', rel.join(' '));
			if (!link.hasAttribute('referrerpolicy')) {
				link.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
			}
		});
	}

	function setupThemeToggle() {
		const toggle = byId('theme-toggle');
		if (!toggle) return;

		const preferred = readStorage('sirep-theme', 'dark');
		if (preferred === 'light') {
			document.body.classList.add('light-theme');
			toggle.textContent = '🌙';
		}

		toggle.addEventListener('click', () => {
			document.body.classList.toggle('light-theme');
			const isLight = document.body.classList.contains('light-theme');
			toggle.textContent = isLight ? '🌙' : '☀️';
			writeStorage('sirep-theme', isLight ? 'light' : 'dark');
		});
	}

	function runEntranceAnimations() {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion || !hasGsap()) return;

		window.gsap.from('.hero h1', {
			opacity: 0,
			y: 50,
			duration: 1.2,
			ease: 'power3.out'
		});
		window.gsap.from('.stat-card', {
			opacity: 0,
			y: 30,
			stagger: 0.15,
			duration: 0.8,
			delay: 0.5
		});
		window.gsap.from('.module-card', {
			opacity: 0,
			scale: 0.9,
			stagger: 0.1,
			duration: 1,
			delay: 0.8
		});
		window.gsap.from('.quick-links a', {
			opacity: 0,
			y: 12,
			stagger: 0.06,
			duration: 0.55,
			delay: 0.4
		});
	}

	function setupLoader() {
		window.addEventListener('load', () => {
			const loader = byId('app-loader');
			if (!loader) return;
			loader.classList.add('done');
			window.setTimeout(() => loader.remove(), 380);
		});
	}

	function setupBotConsentGate() {
		var btn = byId('bot-launch-btn');
		var cb = byId('sirep-consent-check');
		if (!cb || !btn) return;

		function applyConsent(checked) {
			if (checked) {
				btn.style.pointerEvents = 'auto';
				btn.style.opacity = '1';
				btn.style.cursor = 'pointer';
				btn.removeAttribute('aria-disabled');
			} else {
				btn.style.pointerEvents = 'none';
				btn.style.opacity = '0.45';
				btn.style.cursor = 'not-allowed';
				btn.setAttribute('aria-disabled', 'true');
			}
		}

		cb.addEventListener('change', function () {
			applyConsent(cb.checked);
		});

		// Initialize — bot locked until consent is given
		applyConsent(cb.checked);
	}

	function initRatingSummary() {
		const rows = document.querySelectorAll('#rating-bars .rating-bar-row');
		if (!rows.length) return;

		let total = 0;
		let weightedSum = 0;
		let maxCount = 0;

		rows.forEach((row) => {
			const count = parseInt(row.dataset.count, 10);
			const stars = parseInt(row.dataset.stars, 10);
			total += count;
			weightedSum += count * stars;
			if (count > maxCount) maxCount = count;
		});

		const avgEl = byId('avg-rating');
		const totalEl = byId('total-reviews');
		if (avgEl) avgEl.textContent = total > 0 ? (weightedSum / total).toFixed(1) : '0.0';
		if (totalEl) totalEl.textContent = String(total);

		rows.forEach((row) => {
			const count = parseInt(row.dataset.count, 10);
			const pct = maxCount > 0 ? ((count / maxCount) * 100).toFixed(1) : 0;
			const fill = row.querySelector('.rating-bar-fill');
			if (fill) fill.style.width = pct + '%';
		});
	}

	function init() {
		state.charts.energy = createChart('energyChart', CONFIG.energy);
		state.charts.water  = createChart('waterChart', CONFIG.water);
		state.charts.soil   = createChart('soilChart', CONFIG.soil);
		state.charts.temp   = createChart('tempChart', CONFIG.temp);

		setupStreamToggle();
		setStreamingState(true);
		startTelemetry();
		setupSmoothAnchors();
		secureExternalLinks();
		setupThemeToggle();
		runEntranceAnimations();
		setupLoader();
		setupBotConsentGate();
		initRatingSummary();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
})();


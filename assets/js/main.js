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
		}
	};
	Object.freeze(CONFIG);
	Object.freeze(CONFIG.energy);
	Object.freeze(CONFIG.water);

	const state = {
		timerId: null,
		charts: {},
		isStreaming: true,
		lastTickTs: 0,
		healthScore: 98,
		samples: {
			energy: [],
			water: []
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

	function updateOpsUI(powerValue, flowValue, latency) {
		const qualityEl = byId('ops-quality');
		const latencyEl = byId('ops-latency');
		const modeEl = byId('ops-mode');

		state.samples.energy.push(powerValue);
		state.samples.water.push(flowValue);
		if (state.samples.energy.length > 8) state.samples.energy.shift();
		if (state.samples.water.length > 8) state.samples.water.shift();

		const outOfBand = powerValue < 61 || powerValue > 74 || flowValue < 122 || flowValue > 148;
		state.healthScore = Math.max(85, Math.min(99.8, state.healthScore + (outOfBand ? -0.9 : 0.35)));

		if (qualityEl) qualityEl.textContent = formatNumber(state.healthScore);
		if (latencyEl) latencyEl.textContent = String(Math.max(1, Math.round(latency)));
		if (modeEl) modeEl.textContent = outOfBand ? 'SIMULATION / WATCH' : 'SIMULATION / STABLE';

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
			const flowValue = randomInRange(CONFIG.water.min, CONFIG.water.max);

			updateValue('val-pwr', powerValue);
			updateValue('val-flow', flowValue);

			pushPoint(state.charts.energy, powerValue);
			pushPoint(state.charts.water, flowValue);
			updateOpsUI(powerValue, flowValue, latency);
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

	function init() {
		state.charts.energy = createChart('energyChart', CONFIG.energy);
		state.charts.water = createChart('waterChart', CONFIG.water);

		setupStreamToggle();
		setStreamingState(true);
		startTelemetry();
		setupSmoothAnchors();
		secureExternalLinks();
		setupThemeToggle();
		runEntranceAnimations();
		setupLoader();
		setupBotConsentGate();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
})();

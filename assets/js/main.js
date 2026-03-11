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

	const state = {
		timerId: null,
		charts: {}
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

	function startTelemetry() {
		if (!state.charts.energy && !state.charts.water) return;

		if (state.timerId) {
			window.clearInterval(state.timerId);
		}

		state.timerId = window.setInterval(() => {
			const powerValue = randomInRange(CONFIG.energy.min, CONFIG.energy.max);
			const flowValue = randomInRange(CONFIG.water.min, CONFIG.water.max);

			updateValue('val-pwr', powerValue);
			updateValue('val-flow', flowValue);

			pushPoint(state.charts.energy, powerValue);
			pushPoint(state.charts.water, flowValue);
		}, CONFIG.updateIntervalMs);
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

	function setupThemeToggle() {
		const toggle = byId('theme-toggle');
		if (!toggle) return;

		const preferred = localStorage.getItem('sirep-theme') || 'dark';
		if (preferred === 'light') {
			document.body.classList.add('light-theme');
			toggle.textContent = '🌙';
		}

		toggle.addEventListener('click', () => {
			document.body.classList.toggle('light-theme');
			const isLight = document.body.classList.contains('light-theme');
			toggle.textContent = isLight ? '🌙' : '☀️';
			localStorage.setItem('sirep-theme', isLight ? 'light' : 'dark');
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

	function init() {
		state.charts.energy = createChart('energyChart', CONFIG.energy);
		state.charts.water = createChart('waterChart', CONFIG.water);

		startTelemetry();
		setupSmoothAnchors();
		setupThemeToggle();
		runEntranceAnimations();
		setupLoader();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
})();

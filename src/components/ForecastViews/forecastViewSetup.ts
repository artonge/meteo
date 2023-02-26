import { ref, watch, onMounted, type Ref } from 'vue'
import { isAfter, isSameDay } from 'date-fns'
import 'chartjs-adapter-date-fns'
import { Chart, PointElement, TimeScale, LinearScale, BarController, BarElement, LineController, LineElement, Filler } from 'chart.js'
import type { ChartDatasetCustomTypesPerDataset, ChartOptions, Point, ParsingOptions } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import zoomPlugin from 'chartjs-plugin-zoom'
import type { Forecast, HourlyForecast } from '@/lib/open-meteo';
import { computedPanOffset } from '@/lib/utils'
import { tickerPlugin } from '@/plugins/ticker'
import { debounce } from 'debounce'

Chart.register(
	Filler,
	LineController,
	LineElement,
	PointElement,
	BarController,
	BarElement,
	TimeScale,
	LinearScale,
)

export function setupForecastView(
	props: Readonly<{
		forecast: Forecast;
		ticker: number;
		zoom: {
			scale: number;
			offset: number;
		};
	}>,
	emit: (event: "update:zoom" | "update:ticker", ...args: any[]) => void,
	getDatasets: (forecast: Forecast) => ChartDatasetCustomTypesPerDataset[],
	getScales: (forecast: Forecast) => ChartOptions<'line'>['scales'],
) {
	const canvas: Ref<HTMLCanvasElement | null> = ref(null)
	const chart: Ref<Chart | null> = ref(null)
	const hoveredDataPoint: Ref<HourlyForecast | null> = ref(null)

	onMounted(() => {
		createChart()
	})

	watch(() => props.forecast, () => {
		createChart()
		if (props.forecast.hourly.length > 0) {
			hoveredDataPoint.value = props.forecast.hourly[0]
		}
	}, { immediate: true })

	watch(() => props.ticker, (tickerValue) => {
		if (canvas.value?.offsetLeft === 0) {
			chart.value?.setTicker(tickerValue)
		}
	})

	function emitUpdateTicker(x: number) {
		emit('update:ticker', x)
	}

	function createChart() {
		if (canvas.value === null) {
			return
		}

		if (chart.value !== null) {
			chart.value.destroy()
		}

		chart.value = new Chart(canvas.value, {
			plugins: [
				ChartDataLabels,
				zoomPlugin,
				tickerPlugin,
			],
			data: {
				labels: props.forecast.hourly.map(({ time }) => time),
				datasets: [
					...getDatasets(props.forecast)
						.map(dataset => {
							return {
								...dataset,
								...{parsing: false} as ParsingOptions,
								normalized: true,
								data: dataset.data.map((y, i) => ({x: props.forecast.hourly[i].time, y})),
							}
						}),
				],
			},
			options: {
				animation: false,
				responsive: true,
				maintainAspectRatio: false,
				elements: {
					point: {
						pointStyle: false,
						radius: 0,
					},
				},
				plugins: {
					tooltip: {
						enabled: false,
					},
					legend: {
						display: false,
					},
					datalabels: {
						color: 'gray',
						align: 'top',
						formatter: value => value.y,
						display: function (context) {
							// Only show label for the first dataset.
							if (context.datasetIndex !== 0) {
								return false
							}

							// Do no show label for the first data point.
							if (context.dataIndex === 0) {
								return false
							}

							const {x: time, y: value} = (context.dataset.data[context.dataIndex] as Point)
							const pointsForDay = (context.dataset.data as Point[]).filter(p => isSameDay(p.x, time))
							const valuesForDay = pointsForDay.map(p => p.y)
							const currentIndex = pointsForDay.findIndex(p => (p as Point).x === time)

							const isHightest = !valuesForDay.some(dataPointValue => dataPointValue > value)
							const isLowest = !valuesForDay.some(dataPointValue => dataPointValue < value)
							const isUniq = valuesForDay.filter(dataPointValue => dataPointValue === value).length === 1
							const isFirst = valuesForDay.findIndex(dataPointValue => dataPointValue === value) === currentIndex

							return (isHightest || isLowest) && (isUniq || isFirst)
						},
					},
					zoom: {
						pan: {
							enabled: true,
							mode: 'x',
							scaleMode: 'x',
							// Do not pan when not zoomed or when at the edge of the chart.
							onPanStart: ({ chart }) => chart.getZoomLevel() !== 1 && computedPanOffset(chart) !== 0 && computedPanOffset(chart) !== 1,
							onPan({ chart }) {
								emit('update:zoom', {
									scale: chart.getZoomLevel(),
									offset: computedPanOffset(chart),
								})
							},
						},
						zoom: {
							mode: 'x',
							wheel: {
								enabled: true,
							},
							pinch: {
								enabled: true
							},
							onZoom({ chart }) {
								emit('update:zoom', {
									scale: chart.getZoomLevel(),
									offset: computedPanOffset(chart),
								})
							}
						},
						limits: {
							x: {
								min: 'original',
								max: 'original',
								minRange: 1000 * 60 * 60 * 24 * 3,
							}
						}
					},
					ticker: {
						onTick(chart, x) {
							const timestamp = chart.scales.x.getValueForPixel(x) as number
							const index = props.forecast.hourly.findIndex(dataPoint => isAfter(new Date(dataPoint.time), timestamp))
							hoveredDataPoint.value = props.forecast.hourly[index - 1] ?? props.forecast.hourly[0]
							debounce(emitUpdateTicker.bind(this, x), 1000)
						},
						onTickOut() {
							emitUpdateTicker(-1)
							hoveredDataPoint.value = props.forecast.hourly[0]
						},
					},
				},
				scales: {
					x: {
						type: 'time',
						time: {
							unit: 'day',
							displayFormats: {
								day: 'ccc'
							},
						},
						ticks: {
							align: 'start',
							sampleSize: 1,
							font: {
								size: 16,
							},
						},
						// Prevent padding due to last tick label
						afterFit(axis) {
							axis.paddingRight = 0;
						},
						grid: {
							color: 'rgba(68, 76, 86)',
							offset: false,
						},
						offset: false,
					},
					...getScales(props.forecast)
				},
			},
		})
	}

	return { props, emit, hoveredDataPoint, canvas, chart }
}
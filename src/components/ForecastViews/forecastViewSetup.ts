import { ref, watch, onMounted, type Ref } from 'vue'
import { format, isAfter } from 'date-fns'
import 'chartjs-adapter-date-fns'
import { Chart, type ChartDatasetCustomTypesPerDataset, type ChartOptions } from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import zoomPlugin from 'chartjs-plugin-zoom'
import type { ForecastTimeStep } from '@/lib/met'
import { computedPanOffset } from '@/lib/utils'
import { tickerPlugin } from '@/plugins/ticker'
import { debounce } from 'debounce'

export function setupForecastView(
	props: Readonly<{
		forecast: ForecastTimeStep[];
		ticker: number;
		zoom: {
			scale: number;
			offset: number;
		};
	}>,
	emit: (event: "update:zoom" | "update:ticker", ...args: any[]) => void,
	getDatasets: (forecast: ForecastTimeStep[]) => ChartDatasetCustomTypesPerDataset[],
	getScales: (forecast: ForecastTimeStep[]) => ChartOptions<'line'>['scales'],
) {
	const canvas: Ref<HTMLCanvasElement | null> = ref(null)
	const chart: Ref<Chart | null> = ref(null)
	const hoveredDataPoint: Ref<ForecastTimeStep | null> = ref(null)

	onMounted(() => {
		createChart()
	})

	watch(() => props.forecast, () => {
		createChart()
		if (props.forecast.length > 0) {
			hoveredDataPoint.value = props.forecast[0]
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
		console.log(canvas.value, getDatasets(props.forecast))
		chart.value = new Chart(canvas.value, {
			plugins: [
				ChartDataLabels,
				zoomPlugin,
				tickerPlugin,
			],
			data: {
				labels: props.forecast.map((dataPoint) => dataPoint.time),
				datasets: [
					...getDatasets(props.forecast),
				],
			},
			options: {
				animation: false,
				responsive: true,
				maintainAspectRatio: false,
				elements: {
					point: {
						pointStyle: false,
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
						display: function (context) {
							// Only show label for the first dataset.
							if (context.datasetIndex !== 0) {
								return false
							}

							// Do no show label for the first data point.
							if (context.dataIndex === 0) {
								return false
							}

							const time = props.forecast[context.dataIndex].time.slice(0, 10)
							const firstPointOfDayIndex = props.forecast.findIndex(dataPoint => dataPoint.time.slice(0, 10) === time)
							const lastPointOfDayIndex = props.forecast.slice(firstPointOfDayIndex).findIndex(dataPoint => time !== dataPoint.time.slice(0, 10)) - 1
							const pointsForDay = context.dataset.data.slice(firstPointOfDayIndex, lastPointOfDayIndex + firstPointOfDayIndex)

							const value = context.dataset.data[context.dataIndex] as number
							const isHightest = !pointsForDay.some(dataPointValue => (dataPointValue as number) > value)
							const isLowest = !pointsForDay.some(dataPointValue => (dataPointValue as number) < value)
							const isUniq = pointsForDay.filter(dataPointValue => (dataPointValue as number) === value).length === 1
							const isFirst = pointsForDay.findIndex(dataPointValue => (dataPointValue as number) === value) + firstPointOfDayIndex === context.dataIndex

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
							const index = props.forecast.findIndex(dataPoint => isAfter(new Date(dataPoint.time), timestamp))
							hoveredDataPoint.value = props.forecast[index - 1] ?? props.forecast[0]
							debounce(emitUpdateTicker.bind(this, x), 1000)
						},
						onTickOut() {
							emitUpdateTicker(-1)
							hoveredDataPoint.value = props.forecast[0]
						},
					},
				},
				scales: {
					x: {
						type: 'time',
						time: {
							unit: 'day',
						},
						ticks: {
							callback: (val) => format(new Date(val), 'ccc'),
							align: 'start',
							font: {
								size: 16,
							},
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
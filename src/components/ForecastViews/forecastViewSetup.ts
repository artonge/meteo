import { ref, watch, onMounted, defineProps, defineEmits, type Ref } from 'vue'
import { format, isAfter } from 'date-fns'
import 'chartjs-adapter-date-fns'
import { Chart, type ChartDatasetCustomTypesPerDataset, type ChartOptions } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import zoomPlugin from 'chartjs-plugin-zoom'
import type { ForecastTimeStep } from '@/lib/met'
import { computedPanOffset } from '@/lib/utils'
import { tickerPlugin } from '@/plugins/ticker'

type _defineProps = typeof defineProps
type _defineEmits = typeof defineEmits

export function setupForecastView<TType, TData>(
	_: {
		defineProps: _defineProps,
		defineEmits: _defineEmits,
	},
	getDatasets: (forecast: ForecastTimeStep[]) => ChartDatasetCustomTypesPerDataset[],
	getScales: (forecast: ForecastTimeStep[]) => ChartOptions<'line'>['scales'],
) {
	const props = defineProps<{
		forecast: ForecastTimeStep[],
		ticker: number,
		zoom: {
			scale: number,
			offset: number,
		},
	}>()

	const emit = defineEmits(['update:zoom', 'update:ticker'])

	const canvas: Ref<HTMLCanvasElement | null> = ref(null)
	const chart: Ref<Chart | null> = ref(null)
	const hoveredDataPoint: Ref<ForecastTimeStep | null> = ref(null)

	onMounted(createChart)

	watch(() => props.forecast, () => {
		createChart()
		if (props.forecast.length > 0) {
			hoveredDataPoint.value = props.forecast[0]
		}
	})

	watch(() => props.ticker, (tickerValue) => {
		if (canvas.value?.offsetLeft === 0) {
			chart.value?.setTicker(tickerValue)
		}
	})

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
							if (context.datasetIndex !== 0) {
								return false
							}

							const value = context.dataset.data[context.dataIndex] as number
							const prev = context.dataset.data[context.dataIndex - 1] ?? value
							const next = context.dataset.data[context.dataIndex + 1] ?? value

							const isLocalMax = prev < value && value > next
							const isLocalMin = prev > value && value < next

							return context.dataIndex === 0 || isLocalMax || isLocalMin
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
							// Asynchronously emit event to not block rendering.
							setTimeout(() => emit('update:ticker', x))
						},
						onTickOut() {
							// Asynchronously emit event to not block rendering.
							setTimeout(() => emit('update:ticker', -1))
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

	return { props, emit, hoveredDataPoint }
}
import { ref, watch, onMounted, type Ref } from 'vue'
import { startOfDay } from 'date-fns'
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
			min: number;
			max: number;
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
		if (canvas.value?.getBoundingClientRect().x === 0) {
			return
		}

		setTimeout(() => {
			if (chart.value === null) {
				throw new Error('Chart should not be null')
			}

			console.debug('automated tick to', tickerValue)

			chart.value.setTicker(tickerValue)
			updateHoveredDataPoint(chart.value, tickerValue)
		})
	})

	watch(() => props.zoom, (zoomValue) => {
		if (canvas.value?.getBoundingClientRect().x === 0) {
			return
		}

		setTimeout(() => {
			if (chart.value === null) {
				throw new Error('Chart should not be null')
			}

			console.debug('automated zoom to', { ...props.zoom })

			const xScale = chart.value.scales[chart.value.getDatasetMeta(0).xAxisID as string]
			chart.value.resetZoom()
			chart.value.zoom({ x: zoomValue.scale })
			chart.value.pan({ x: xScale.getPixelForValue(chart.value.scales.x.min) - xScale.getPixelForValue(zoomValue.min) })
		})
	})

	function emitUpdateTicker(x: number): void { emit('update:ticker', x) }
	const debouncedEmitUpdateTicker = debounce(emitUpdateTicker, 100)

	const debouncedEmitUpdateZoom = debounce(function emitUpdateZoom(chart: Chart): void {
		if (canvas.value?.getBoundingClientRect().x !== 0) {
			return
		}

		const zoom = {
			scale: chart.getZoomLevel(),
			min: chart.scales.x.min,
			max: chart.scales.x.max,
		}

		console.debug('emit update:zoom', zoom)
		emit('update:zoom', zoom)
	}, 100)

	function updateHoveredDataPoint(chart: Chart, x: number) {
		const timestamp = chart.scales.x.getValueForPixel(x) as number
		const index = props.forecast.hourly.findIndex(dataPoint => dataPoint.time.getTime() > timestamp)
		hoveredDataPoint.value = props.forecast.hourly[index - 1] ?? props.forecast.hourly[0]
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
								...{ parsing: false } as ParsingOptions,
								normalized: true,
								data: dataset.data.map((y, i) => ({ x: props.forecast.hourly[i].time.getTime(), y })),
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
						formatter: value => value.y.toString(),
						display(context) {
							// Do no show label for the first data point.
							if (context.dataIndex === 0) {
								return false
							}

							const { x: time, y: value } = (context.dataset.data[context.dataIndex] as Point)
							const start = startOfDay(time).getTime()
							const end = start + 1000 * 60 * 60 * 24
							const pointsForDay = (context.dataset.data as Point[]).filter(({ x }) => start < x && x <= end)
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
							onPanStart({ chart, event }) {
								if (chart.getZoomLevel() === 1) {
									return false
								}

								const direction = (event as any).direction as number

								console.debug('pan start', event.type, {
									...props.zoom,
									dataMin: props.forecast?.hourly[0].time.getTime(),
									dataMax: props.forecast?.hourly[props.forecast.hourly.length - 1].time.getTime(),
									direction: direction,
								})

								if (direction !== 2 && direction !== 4) {
									console.debug("abort pan - vertical panning")
									return false
								}

								if (props.zoom.min === props.forecast.hourly[0].time.getTime() && direction !== 2) {
									console.debug("abort pan - edge")
									return false
								}

								if (props.zoom.max === props.forecast.hourly[props.forecast.hourly.length - 1].time.getTime() && direction !== 4) {
									console.debug("abort pan")
									return false
								}

								return true
							},
							onPan({ chart }) {
								debouncedEmitUpdateZoom(chart)
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
								debouncedEmitUpdateZoom(chart)
							},
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
							updateHoveredDataPoint(chart, x)
							debouncedEmitUpdateTicker(x)
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
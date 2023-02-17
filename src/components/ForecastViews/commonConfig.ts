import type { Ref } from 'vue'
import { format, isAfter } from 'date-fns'
import type { ChartOptions, Plugin, Chart } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import zoomPlugin from 'chartjs-plugin-zoom'
import type { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options'
import 'chartjs-adapter-date-fns'

import { tickerPlugin } from '@/plugins/ticker'
import type { TickerOptions } from '@/plugins/ticker/index.d'
import type { ForecastTimeStep } from '@/lib/met'
import { isTouchEvent } from '@/lib/utils'

export declare type ObjectEmitsOptions = Record<string, ((...args: any[]) => any) | null>;
declare type EmitFn<Options = ObjectEmitsOptions, Event extends keyof Options = keyof Options> = Options extends Array<infer V> ? (event: V, ...args: any[]) => void : {} extends Options ? (event: string, ...args: any[]) => void : UnionToIntersection<{
	[key in Event]: Options[key] extends (...args: infer Args) => any ? (event: key, ...args: Args) => void : (event: key, ...args: any[]) => void;
}[Event]>;

export const defaultChartOptions: ChartOptions<'line'> = {
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
	}
}

export function getTickerPluginOptions(forecast: ForecastTimeStep[], hoveredDataPoint: Ref<ForecastTimeStep>, emit: EmitFn<['update:ticker']>): Partial<TickerOptions> {
	return {
		onTick(chart, x) {
			const timestamp = chart.scales.x.getValueForPixel(x) as number
			const index = forecast.findIndex(dataPoint => isAfter(new Date(dataPoint.time), timestamp))
			hoveredDataPoint.value = forecast[index - 1] ?? forecast[0]
			setTimeout(() => emit('update:ticker', x))
		},
		onTickOut() {
			setTimeout(() => emit('update:ticker', -1))
			hoveredDataPoint.value = forecast[0]
		},
	}
}

function computedPanOffset(chart: Chart) {
	const halfWindow = (chart.scales.x.max - chart.scales.x.min) / 2
	const mid = chart.scales.x.min + halfWindow
	const { x: { max: initialMax, min: initialMin } } = chart.getInitialScaleBounds()
	const windowedMax = initialMax - halfWindow
	const windowedMin = initialMin + halfWindow
	return (mid - windowedMin) / (windowedMax - windowedMin)
}

export function getZoomPluginOptions(emit: EmitFn<['update:zoom']>): ZoomPluginOptions {
	return {
		pan: {
			enabled: true,
			mode: 'x',
			scaleMode: 'x',
			onPanStart({ chart }) { return chart.getZoomLevel() !== 1 && computedPanOffset(chart) !== 0 && computedPanOffset(chart) !== 1 },
			onPan({ chart }) {
				emit('update:zoom', {
					scale: chart.getZoomLevel(),
					offset: computedPanOffset(chart),
				})
				return true
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
	}
}

export const defaultChartPlugins: Plugin<'line'>[] = [
	ChartDataLabels,
	zoomPlugin,
	tickerPlugin,
]

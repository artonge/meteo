import { format } from 'date-fns'
import type { ChartOptions, Plugin } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import 'chartjs-adapter-date-fns'

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
			},
			grid: {
				color: 'gray',
				offset: false,
			},
			offset: false,
		},
	},
	plugins: {
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
		}

	}
}

export const defaultChartPlugins: Plugin<'line'>[] = [
	ChartDataLabels,
]

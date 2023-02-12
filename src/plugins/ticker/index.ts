import type { Chart, Plugin } from 'chart.js'
import type { TickerOptions } from './index.d'

function getDefaultOptions(): Partial<TickerOptions> {
	return {
		color: '#F66',
		width: 1,
	}
}

function getOption<T extends keyof TickerOptions>(chart: Chart, name: T): TickerOptions[T] {
	return (chart.options?.plugins?.ticker?.[name] ?? getDefaultOptions()[name]) as TickerOptions[T]
}

function drawTraceLine(chart: Chart, event: MouseEvent) {
	const yScale = chart.scales[chart.getDatasetMeta(0).yAxisID as string]

	chart.draw()
	chart.ctx.beginPath();
	chart.ctx.moveTo(event.x, yScale.getPixelForValue(yScale.max));
	chart.ctx.lineWidth = getOption(chart, 'width') as number;
	chart.ctx.strokeStyle = getOption(chart, 'color') as string;
	chart.ctx.lineTo(event.x, yScale.getPixelForValue(yScale.min));
	chart.ctx.stroke();
	chart.ctx.setLineDash([]);
}

export const tickerPlugin: Plugin = {
	id: 'ticker',

	afterInit: function (chart) {
		if (chart.options.plugins === undefined) {
			chart.options.plugins = {}
		}

		if (chart.options.plugins.ticker === undefined) {
			chart.options.plugins.ticker = {}
		}

		chart.options.plugins.ticker.abortController = new AbortController()

		chart.canvas.addEventListener(
			'mousemove',
			(event) => {
				drawTraceLine(chart, event)
				const onTick = getOption(chart, 'onTick')
				if (onTick !== undefined) {
					onTick(chart, event)
				}
			},
			{ signal: getOption(chart, 'abortController').signal },
		)

		chart.canvas.addEventListener(
			'mouseleave',
			(event) => {
				chart.draw()
				const onTickOut = getOption(chart, 'onTickOut')
				if (onTickOut !== undefined) {
					onTickOut(chart, event)
				}
			},
			{ signal: getOption(chart, 'abortController').signal }
		)
	},

	afterDestroy(chart) {
		getOption(chart, 'abortController').abort()
	},
}

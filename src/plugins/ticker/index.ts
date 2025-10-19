import type { Chart, Plugin } from 'chart.js'
import type { TickerOptions } from './index.d'

function handlePointerEvent(chart: Chart, options: TickerOptions, event: PointerEvent, touchCanceled: boolean, cancelTouch: () => void) {
	const y = event.offsetY
	const x = event.offsetX

	if (touchCanceled || chart.scales.x === undefined) {
		return
	}

	console.debug("Ticker", event)

	if (event.pointerType === 'touch') {
		if (event.type === 'pointerdown') {
			// Ignore touch starting outside of the bottom scale.
			// Add a 50% extra space to trigger it on mobile as the bottom scale is a bit small.
			const isBellowTopOfScale = (chart.scales.x.top - 0.5 * (chart.scales.x.bottom - chart.scales.x.top)) < y
			const isAboveBottomOfScale = y < chart.scales.x.bottom

			if (!(isBellowTopOfScale && isAboveBottomOfScale)) {
				cancelTouch()
				return
			}
		}

		console.debug("Ticker: stop propagation", event.type)
		event.stopPropagation()
	}

	drawTraceLine(chart, options, x)

	if (options.onTick !== undefined) {
		options.onTick(chart, x)
	}
}

function drawTraceLine(chart: Chart, options: TickerOptions, x: number) {
	const yScale = chart.scales[chart.getDatasetMeta(0).yAxisID as string]

	if (chart.scales.x === undefined || yScale === undefined) {
		return
	}

	chart.draw()
	chart.ctx.beginPath()
	chart.ctx.moveTo(x, yScale.getPixelForValue(yScale.max))
	chart.ctx.lineWidth = options.width as number
	chart.ctx.strokeStyle = options.color as string
	chart.ctx.lineTo(x, chart.scales.x.bottom)
	chart.ctx.stroke()
	chart.ctx.setLineDash([])
}

export const tickerPlugin: Plugin = {
	id: 'ticker',

	afterInit: function (chart, args, options: TickerOptions) {
		if (chart.options.plugins === undefined) {
			chart.options.plugins = {}
		}

		if (chart.options.plugins.ticker === undefined) {
			chart.options.plugins.ticker = {}
		}

		options.abortController = new AbortController()
		const signal = options.abortController.signal

		let touchCanceled = false
		function drawTicker(event: PointerEvent) {
			handlePointerEvent(chart, options, event, touchCanceled, () => touchCanceled = true)
		}
		chart.canvas.addEventListener('pointerdown', drawTicker, { signal })
		chart.canvas.addEventListener('pointermove', drawTicker, { signal })
		chart.canvas.addEventListener('pointerup', () => touchCanceled = false, { signal })

		chart.setTicker = (x: number) => {
			if (x === -1) {
				return
			}
			drawTraceLine(chart, options, x)
		}
	},

	afterDestroy(chart, args, options: TickerOptions) {
		options.abortController.abort()
	},

	defaults: {
		color: '#a51616',
		width: 2,
	},
}

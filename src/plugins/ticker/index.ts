import type { Chart, Plugin } from 'chart.js'
import type { TickerOptions } from './index.d'

function isTouchEvent(event: UIEvent): event is TouchEvent {
	return event.type === 'touchmove' || event.type === 'touchstart'
}

function handlePointerEvent(chart: Chart, options: TickerOptions, event: MouseEvent | TouchEvent, touchCanceled: boolean, cancelTouch: () => void) {
	// Get mouse location inside canvas
	const { x: canvasX, y: canvasY } = chart.canvas.getBoundingClientRect()
	let x = 0
	let y = 0

	if (isTouchEvent(event)) {
		x = event.touches[0].clientX - canvasX
		y = event.touches[0].clientY - canvasY

		// Ignore touch starting outside of the bottom scale.
		// Add a 50% extra space to trigger it on mobile as the bottom scale is a bit small.
		const isBellowTopOfScale = (chart.scales.x.top - 0.5 * (chart.scales.x.bottom - chart.scales.x.top)) < y
		const isAboveBottomOfScale = y < chart.scales.x.bottom
		if (event.type === 'touchstart' && !(isBellowTopOfScale && isAboveBottomOfScale)) {
			cancelTouch()
			return
		}

		if (event.type === 'touchmove' && touchCanceled) {
			return
		}
		event.stopPropagation()
	} else {
		x = event.clientX - canvasX
		y = event.clientY - canvasY
	}

	drawTraceLine(chart, options, x)

	const onTick = options.onTick
	if (onTick !== undefined) {
		onTick(chart, x)
	}
}

function drawTraceLine(chart: Chart, options: TickerOptions, x: number) {
	const yScale = chart.scales[chart.getDatasetMeta(0).yAxisID as string]

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
		function drawTicker(event: MouseEvent | TouchEvent) {
			handlePointerEvent(chart, options, event, touchCanceled, () => touchCanceled = true)
		}
		chart.canvas.addEventListener('mousemove', drawTicker, { signal })
		chart.canvas.addEventListener('touchstart', drawTicker, { signal })
		chart.canvas.addEventListener('touchmove', drawTicker, { signal })
		chart.canvas.addEventListener('touchend', () => touchCanceled = false, { signal })
		chart.canvas.addEventListener('mouseleave',
			() => {
				chart.draw()
				if (options.onTickOut !== undefined) {
					options.onTickOut(chart)
				}
			},
			{ signal }
		)

		chart.setTicker = (x: number) => {
			if (x === -1) {
				return
			}
			drawTraceLine(chart, options, x)
		}
	},

	afterDestroy(chart, args, options: TickerOptions) {
		console.log(options)
		options.abortController.abort()
	},

	defaults: {
		color: '#F66',
		width: 2,
	},
}

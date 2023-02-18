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

function isTouchEvent(event: UIEvent): event is TouchEvent {
	return event.type === 'touchmove' || event.type === 'touchstart'
}

function handlePointerEvent(chart: Chart, event: MouseEvent | TouchEvent, touchCanceled: boolean, cancelTouch: () => void) {
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

	drawTraceLine(chart, x)

	const onTick = getOption(chart, 'onTick')
	if (onTick !== undefined) {
		onTick(chart, x)
	}
}

function drawTraceLine(chart: Chart, x: number) {
	const yScale = chart.scales[chart.getDatasetMeta(0).yAxisID as string]

	chart.draw()
	chart.ctx.beginPath();
	chart.ctx.moveTo(x, yScale.getPixelForValue(yScale.max));
	chart.ctx.lineWidth = getOption(chart, 'width') as number;
	chart.ctx.strokeStyle = getOption(chart, 'color') as string;
	chart.ctx.lineTo(x, chart.scales.x.bottom);
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

		let touchCanceled = false
		function drawTicker(event: MouseEvent | TouchEvent) {
			handlePointerEvent(chart, event, touchCanceled, () => touchCanceled = true)
		}
		chart.canvas.addEventListener('mousemove', drawTicker, { signal: getOption(chart, 'abortController').signal })
		chart.canvas.addEventListener('touchstart', drawTicker, { signal: getOption(chart, 'abortController').signal })
		chart.canvas.addEventListener('touchmove', drawTicker, { signal: getOption(chart, 'abortController').signal })
		chart.canvas.addEventListener('touchend', () => touchCanceled = false, { signal: getOption(chart, 'abortController').signal })
		chart.canvas.addEventListener(
			'mouseleave',
			() => {
				chart.draw()
				const onTickOut = getOption(chart, 'onTickOut')
				if (onTickOut !== undefined) {
					onTickOut(chart)
				}
			},
			{ signal: getOption(chart, 'abortController').signal }
		)

		chart.setTicker = (x: number) => {
			if (x === -1) return
			drawTraceLine(chart, x)
		}
	},

	afterDestroy(chart) {
		getOption(chart, 'abortController').abort()
	},
}

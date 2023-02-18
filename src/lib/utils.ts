import type { Chart } from "chart.js"

export function getMax<T>(data: T[], propFn: (obj: T) => number | undefined): number {
	return data
		.map(propFn)
		.filter((value): value is number => value !== undefined)
		.reduce((maxValue, currentValue) => Math.max(maxValue, currentValue))
}

export function getMin<T>(data: T[], propFn: (obj: T) => number | undefined): number {
	return data
		.map(propFn)
		.filter((value): value is number => value !== undefined)
		.reduce((maxValue, currentValue) => Math.min(maxValue, currentValue))
}

export function formatNumber(n: number = 0): string {
	if (n === 0) {
		return '0.0'
	} else {
		return n.toString()
	}
}

export function computedPanOffset(chart: Chart): number {
	const halfWindow = (chart.scales.x.max - chart.scales.x.min) / 2
	const mid = chart.scales.x.min + halfWindow
	const { x: { max: initialMax, min: initialMin } } = chart.getInitialScaleBounds()
	const windowedMax = initialMax - halfWindow
	const windowedMin = initialMin + halfWindow
	return (mid - windowedMin) / (windowedMax - windowedMin)
}
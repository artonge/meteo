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

export function formatNumber(n: number = 0) {
	if (n === 0) {
		return '0.0'
	} else {
		return n.toString()
	}
}

import { useMemoize } from '@vueuse/core'

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

// Memoized as it can be called a lot of time when moving the ticker.
export const formatNumber = useMemoize(function formatNumber(n: number = 0): string {
	return new Intl.NumberFormat('fr', { minimumFractionDigits: 1 }).format(n)
})

import { Chart, ChartType, Plugin } from 'chart.js';

export interface TickerOptions {
	color: string,
	width: number,
	onTick?(chart: Chart, event: MouseEvent | TouchEvent),
	onTickOut?(chart: Chart, event: MouseEvent | TouchEvent),
	abortController: AbortController,
}

declare module 'chart.js' {
	interface PluginOptionsByType<TType extends ChartType> {
		ticker?: TickerOptions
	}
}

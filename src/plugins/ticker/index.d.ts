import { Chart, ChartType, Plugin } from 'chart.js';

export interface TickerOptions {
	color: string,
	width: number,
	onTick?(chart: Chart, event: MouseEvent),
	onTickOut?(chart: Chart, event: MouseEvent),
	abortController: AbortController,
}

declare module 'chart.js' {
	interface PluginOptionsByType<TType extends ChartType> {
		ticker?: TickerOptions
	}
}

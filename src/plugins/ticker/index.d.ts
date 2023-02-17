import { Chart, ChartType, Plugin } from 'chart.js';

export interface TickerOptions {
	color: string,
	width: number,
	onTick?(chart: Chart, x: number),
	onTickOut?(chart: Chart),
	abortController: AbortController,
}

declare module 'chart.js' {
	interface PluginOptionsByType<TType extends ChartType> {
		ticker?: TickerOptions
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface Chart<TType extends keyof ChartTypeRegistry = keyof ChartTypeRegistry, TData = DistributiveArray<ChartTypeRegistry[TType]['defaultDataPoint']>, TLabel = unknown> {
		setTicker(x: number): void;
	}
}

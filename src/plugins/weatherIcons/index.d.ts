import type { ChartType } from 'chart.js';

import type { Forecast } from '@/lib/open-meteo';

export interface WeatherIconsOptions {
	forecast: Forecast
}

declare module 'chart.js' {
	interface PluginOptionsByType<TType extends ChartType> {
		weatherIcons: WeatherIconsOptions
	}
}

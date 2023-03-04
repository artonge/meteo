declare module 'chart.js' {
	interface ChartDatasetPropertiesCustomTypesPerDataset<TType extends ChartType, TData> {
		/**
		 * Per dataset datalabels plugin options.
		 * @since 0.1.0
		 */
		datalabels?: Options;
	}
}
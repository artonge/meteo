<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import type { ForecastTimeStep } from '@/lib/met'
import { defaultChartOptions, defaultChartPlugins, getTickerPluginOptions, getZoomPluginOptions } from './commonConfig'
import ForecastLayout from './ForecastLayout.vue'

const props = defineProps<{
	forecast: ForecastTimeStep[],
	ticker: number,
	zoom: {
		scale: number,
		offset: number,
	},
}>()

const emit = defineEmits(['update:zoom', 'update:ticker'])

const canvas: Ref<HTMLCanvasElement | null> = ref(null)
const chart: Ref<Chart | null> = ref(null)

const hoveredDataPoint: Ref<ForecastTimeStep> = ref(props.forecast[0])

async function createChart() {
	if (canvas.value === null) {
		return
	}

	if (chart.value !== null) {
		chart.value.destroy()
	}

	// const maxCloud = getMax(props.forecast, dataPoint => dataPoint.data.instant.details?.cloud_area_fraction_medium)
	// const minCloud = getMin(props.forecast, dataPoint => dataPoint.data.instant.details?.cloud_area_fraction_medium)

	chart.value = new Chart(canvas.value, {
		plugins: defaultChartPlugins,
		data: {
			labels: props.forecast.map((dataPoint) => dataPoint.time),
			datasets: [
				{
					type: 'line',
					label: 'Cloud total',
					data: props.forecast.map(
						(dataPoint) => dataPoint.data.instant.details?.cloud_area_fraction || 0,
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(0, 0, 0, 0)',
					backgroundColor: 'rgba(0, 0, 0, 0)',
					fill: 'origin',
					yAxisID: 'yct',
				},
				{
					type: 'line',
					label: 'Cloud low',
					data: props.forecast.map(
						(dataPoint) => dataPoint.data.instant.details?.cloud_area_fraction_low || 0,
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(159, 159, 163, 0.3)',
					backgroundColor: 'rgba(159, 159, 163, 0.3)',
					fill: 'origin',
					yAxisID: 'yc',
				},
				{
					type: 'line',
					label: 'Cloud medium',
					data: props.forecast.map(
						(dataPoint) => dataPoint.data.instant.details?.cloud_area_fraction_medium || 0,
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(159, 159, 163, 0.3)',
					backgroundColor: 'rgba(159, 159, 163, 0.3)',
					fill: 'origin',
					yAxisID: 'yc',
				},
				{
					type: 'line',
					label: 'Cloud hight',
					data: props.forecast.map(
						(dataPoint) => dataPoint.data.instant.details?.cloud_area_fraction_high || 0,
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(159, 159, 163, 0.3)',
					backgroundColor: 'rgba(159, 159, 163, 0.3)',
					fill: 'origin',
					yAxisID: 'yc',
				},
				{
					type: 'line',
					label: 'Cloud low',
					data: props.forecast.map(
						(dataPoint) => -(dataPoint.data.instant.details?.cloud_area_fraction_low || 0),
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(159, 159, 163, 0.3)',
					backgroundColor: 'rgba(159, 159, 163, 0.3)',
					fill: 'origin',
					yAxisID: 'yci',
				},
				{
					type: 'line',
					label: 'Cloud medium',
					data: props.forecast.map(
						(dataPoint) => -(dataPoint.data.instant.details?.cloud_area_fraction_medium || 0),
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(159, 159, 163, 0.3)',
					backgroundColor: 'rgba(159, 159, 163, 0.3)',
					fill: 'origin',
					yAxisID: 'yci',
				},
				{
					type: 'line',
					label: 'Cloud hight',
					data: props.forecast.map(
						(dataPoint) => -(dataPoint.data.instant.details?.cloud_area_fraction_high || 0),
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(159, 159, 163, 0.3)',
					backgroundColor: 'rgba(159, 159, 163, 0.3)',
					fill: 'origin',
					yAxisID: 'yci',
				},
				{
					type: 'bar',
					// TODO: use unit from response
					label: 'Accurate rain (mm)',
					data: props.forecast.map(
						(dataPoint) => dataPoint.data.next_1_hours?.details.precipitation_amount || 0,
					),
					barThickness: 5,
					backgroundColor: 'rgba(0, 145, 205, 0.5)',
					yAxisID: 'yr1',
				},
				// TODO: show in better way
				// {
				// 	type: 'bar',
				// 	label: 'Rain over 6h (mm)',
				// 	data: props.forecast.map(dataPoint => (dataPoint.data.next_6_hours?.details.precipitation_amount || 0) / 6),
				// 	backgroundColor: 'rgba(86, 160, 211, 0.8)',
				// 	yAxisID: 'yr6',
				// },
			],
		},
		options: {
			animation: false,
			responsive: true,
			maintainAspectRatio: false,
			elements: {
				point: {
					pointStyle: false,
				},
			},
			plugins: {
				...defaultChartOptions.plugins,
				zoom: getZoomPluginOptions(emit),
				ticker: getTickerPluginOptions(props.forecast, hoveredDataPoint, emit),
			},
			scales: {
				...defaultChartOptions.scales,
				yct: {
					display: false,
					max: 600,
					min: -600,
					beginAtZero: true,
					stacked: true,
				},
				yc: {
					display: false,
					max: 600,
					min: -600,
					beginAtZero: true,
					stacked: true,
				},
				yci: {
					display: false,
					max: 600,
					min: -600,
					beginAtZero: true,
					stacked: true,
				},
				yr1: {
					display: false,
					position: 'right',
					max: 10,
					beginAtZero: true,
				},
				yr6: {
					display: false,
					position: 'right',
					max: 4,
					beginAtZero: true,
				},
			},
		},
	})
}

onMounted(() => createChart())
watch(() => props.forecast, () => createChart())
watch(() => props.ticker, (tickerValue) => {
	if (canvas.value?.offsetLeft === 0) {
		chart.value?.setTicker(tickerValue)
	}
})
</script>
<template>
	<ForecastLayout :time="hoveredDataPoint.time">
		<template #detail_1>
			<span class="forecast__details__couverture">Couverture</span>
			<span>{{ hoveredDataPoint?.data.instant.details?.cloud_area_fraction }}%</span>
		</template>
		<template #canvas>
			<canvas ref="canvas"></canvas>
		</template>
	</ForecastLayout>
</template>
<style lang="scss" scoped>
.forecast__details {
	&__couverture {
		color: rgba(159, 159, 163);
	}
}
</style>
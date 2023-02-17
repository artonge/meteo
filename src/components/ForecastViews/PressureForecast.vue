<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { isAfter } from 'date-fns'
import type { ForecastTimeStep } from '@/lib/met'
import { formatNumber, getMax, getMin } from '@/lib/utils'
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

	const maxHumidity = getMax(
		props.forecast,
		(dataPoint) => dataPoint.data.instant.details?.relative_humidity,
	)
	const minHumidity = getMin(
		props.forecast,
		(dataPoint) => dataPoint.data.instant.details?.relative_humidity,
	)
	const maxPressure = getMax(
		props.forecast,
		(dataPoint) => dataPoint.data.instant.details?.air_pressure_at_sea_level,
	)
	const minPressure = getMin(
		props.forecast,
		(dataPoint) => dataPoint.data.instant.details?.air_pressure_at_sea_level,
	)

	chart.value = new Chart(canvas.value, {
		plugins: defaultChartPlugins,
		data: {
			labels: props.forecast.map((dataPoint) => dataPoint.time),
			datasets: [
				{
					type: 'line',
					label: 'Humidity (%)',
					data: props.forecast.map(
						(dataPoint) => dataPoint.data.instant.details?.relative_humidity || 0,
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(3, 126, 243, 1)',
					yAxisID: 'yh',
				},
				{
					type: 'line',
					label: 'Pressure (hPa)',
					data: props.forecast.map(
						(dataPoint) => dataPoint.data.instant.details?.air_pressure_at_sea_level || 0,
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(253, 92, 99, 1)',
					backgroundColor: 'rgba(253, 92, 99, 0.2)',
					fill: 'origin',
					yAxisID: 'yp',
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
				{
					type: 'line',
					label: 'Rain over 6h (mm)',
					data: props.forecast.map(
						(dataPoint) => (dataPoint.data.next_6_hours?.details.precipitation_amount || 0) / 6,
					),
					borderColor: 'rgba(86, 160, 211, 0.3)',
					backgroundColor: 'rgba(196, 223, 246, 0.4)',
					cubicInterpolationMode: 'monotone',
					fill: 'origin',
					yAxisID: 'yr6',
				},
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
				yh: {
					display: false,
					beginAtZero: true,
					max: maxHumidity + minHumidity,
					min: -50,
				},
				yp: {
					display: false,
					beginAtZero: true,
					max: maxPressure + 50,
					min: minPressure - 20,
				},
				yr1: {
					display: false,
					position: 'right',
					max: 4,
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
			<span class="forecast__details__humidity">Humidité</span>
			<span>{{ hoveredDataPoint?.data.instant.details?.air_temperature }}%</span>
		</template>
		<template #detail_2>
			<span class="forecast__details__pressure">Pression</span>
			<span>{{ formatNumber(hoveredDataPoint?.data.next_6_hours?.details.precipitation_amount) }}hPa</span>
		</template>
		<template #canvas>
			<canvas ref="canvas"></canvas>
		</template>
	</ForecastLayout>
</template>
<style lang="scss" scoped>
.forecast__details {
	&__humidity {
		color: rgba(3, 126, 243);
	}

	&__pressure {
		color: rgba(253, 92, 99);
	}
}
</style>
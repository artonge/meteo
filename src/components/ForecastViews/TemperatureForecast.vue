<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import Chart from 'chart.js/auto'

import type { ForecastTimeStep } from '@/lib/met'
import { formatNumber, getMax, getMin } from '@/lib/utils'
import { defaultChartOptions, defaultChartPlugins, getTickerPluginOptions, getZoomPluginOptions } from './commonConfig'
import ForecastLayout from './ForecastLayout.vue'

const props = defineProps<{
	forecast: ForecastTimeStep[],
	zoom: {
		scale: number,
		offset: number,
	},
}>()

const emit = defineEmits(['update:zoom'])

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

	const max = getMax(props.forecast, dataPoint => dataPoint.data.instant.details?.air_temperature)
	const min = getMin(props.forecast, dataPoint => dataPoint.data.instant.details?.air_temperature)

	chart.value = new Chart(canvas.value, {
		plugins: defaultChartPlugins,
		data: {
			labels: props.forecast.map((dataPoint) => dataPoint.time),
			datasets: [
				{
					type: 'line',
					label: 'Temperature (°C)',
					data: props.forecast.map(
						(dataPoint) => dataPoint.data.instant.details?.air_temperature || 0,
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(244, 137, 36, 0.8)',
					backgroundColor: 'rgb(255, 200, 69, 0.5)',
					fill: "start",
					yAxisID: 'yt',
				},
				{
					type: 'bar',
					// TODO: use unit from response
					label: 'Rain over 1 hour (mm)',
					data: props.forecast.map(
						(dataPoint) => dataPoint.data.next_1_hours?.details.precipitation_amount || 0,
					),
					barThickness: 5,
					backgroundColor: 'rgba(0, 145, 205, 1)',
					yAxisID: 'yr1',
				},
				{
					type: 'line',
					label: 'Rain over 6h (mm)',
					data: props.forecast.map(
						(dataPoint) => (dataPoint.data.next_6_hours?.details.precipitation_amount || 0) / 6,
					),
					borderColor: 'rgba(86, 160, 211, 0.8)',
					backgroundColor: 'rgba(196, 223, 246, 0.5)',
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
				ticker: getTickerPluginOptions(props.forecast, hoveredDataPoint),
			},
			scales: {
				...defaultChartOptions.scales,
				yt: {
					display: false,
					max: max + (max - min) * 2,
					min: min - (max - min) * 2,
					beginAtZero: true,
				},
				yr1: {
					display: false,
					max: 4,
					beginAtZero: true,
				},
				yr6: {
					display: false,
					max: 4,
					beginAtZero: true,
				},
			},
		},
	})
}

onMounted(() => createChart())
watch(() => props.forecast, () => createChart())
watch(() => props.zoom, () => {
	console.log('zoom updated')
})
</script>
<template>
	<ForecastLayout :time="hoveredDataPoint.time">
		<template #detail_1>
			<span class="forecast__details__temperature">Temperature</span>
			<span>{{ hoveredDataPoint?.data.instant.details?.air_temperature }}°C</span>
		</template>
		<template #detail_2>
			<span class="forecast__details__precipitation">Précipitations</span>
			<span>{{ formatNumber(hoveredDataPoint?.data.next_6_hours?.details.precipitation_amount) }}
				mm/h</span>
		</template>
		<template #canvas>
			<canvas ref="canvas"></canvas>
		</template>
	</ForecastLayout>
</template>
<style lang="scss" scoped>
.forecast__details {
	&__temperature {
		color: rgba(244, 137, 36);
	}

	&__precipitation {
		color: rgba(86, 160, 211);
	}
}
</style>
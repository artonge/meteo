<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { format, isAfter } from 'date-fns'
import type { ForecastTimeStep } from '@/lib/met'
import { formatNumber, getMax, getMin } from '@/lib/utils'
import { defaultChartOptions, defaultChartPlugins } from './commonConfig'
import ForecastLayout from './ForecastLayout.vue'

const props = defineProps<{
	forecast: ForecastTimeStep[]
}>()

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

	const max = getMax(props.forecast, dataPoint => dataPoint.data.instant.details?.wind_speed)
	const min = getMin(props.forecast, dataPoint => dataPoint.data.instant.details?.wind_speed)

	chart.value = new Chart(canvas.value, {
		plugins: defaultChartPlugins,
		data: {
			labels: props.forecast.map((dataPoint) => dataPoint.time),
			datasets: [
				{
					type: 'line',
					label: 'Wind (Km/h)',
					data: props.forecast.map(
						(dataPoint) => dataPoint.data.instant.details?.wind_speed || 0,
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(48, 195, 158, 1)',
					backgroundColor: 'rgba(48, 195, 158, 0.5)',
					fill: 'origin',
					yAxisID: 'y',
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
				ticker: {
					onTick(chart, event) {
						const timestamp = chart.scales.x.getValueForPixel(event.x) as number
						const index = props.forecast.findIndex(dataPoint => isAfter(new Date(dataPoint.time), timestamp))
						hoveredDataPoint.value = props.forecast[index - 1] ?? props.forecast[0]
					},
					onTickOut() {
						hoveredDataPoint.value = props.forecast[0]
					},
				},
			},
			scales: {
				...defaultChartOptions.scales,
				y: {
					display: false,
					beginAtZero: true,
					max: max + (max - min) * 0.5,
				},
			},
		},
	})
}

onMounted(() => createChart())
watch(() => props.forecast, () => createChart())
</script>
<template>
	<ForecastLayout :time="hoveredDataPoint.time">
		<template #detail_1>
			<span class="forecast__details__vitesse">Vitesse</span>
			<span>{{ hoveredDataPoint?.data.instant.details?.wind_speed }} Km/h</span>
		</template>
		<template #canvas>
			<canvas ref="canvas"></canvas>
		</template>
	</ForecastLayout>
</template>
<style lang="scss" scoped>
.forecast__details {
	&__vitesse {
		color: rgba(48, 195, 158);
	}
}
</style>
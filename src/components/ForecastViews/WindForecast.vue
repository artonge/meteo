<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { format } from 'date-fns'
import type { ForecastTimeStep } from '@/lib/met'
import { getMax, getMin } from '@/lib/utils'
import { defaultChartOptions, defaultChartPlugins } from './commonConfig'

const props = defineProps<{
	forecast: ForecastTimeStep[]
}>()

const canvas: Ref<HTMLCanvasElement | null> = ref(null)
const chart: Ref<Chart | null> = ref(null)

async function createChart() {
	if (canvas.value === null) {
		return
	}

	if (chart.value !== null) {
		chart.value.destroy()
	}

	const max = getMax(props.forecast, day => day.data.instant.details?.wind_speed)
	const min = getMin(props.forecast, day => day.data.instant.details?.wind_speed)

	chart.value = new Chart(canvas.value, {
		plugins: defaultChartPlugins,
		data: {
			labels: props.forecast.map((day) => day.time),
			datasets: [
				{
					type: 'line',
					label: 'Wind',
					data: props.forecast.map(
						(day) => day.data.instant.details?.wind_speed || 0,
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
			plugins: defaultChartOptions.plugins,
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
	<canvas ref="canvas"></canvas>
</template>

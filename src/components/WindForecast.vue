<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import 'chartjs-adapter-date-fns'
import Chart from 'chart.js/auto'
import type { ForecastTimeStep } from '@/lib/met'
import { getMax, getMin } from '@/lib/utils'

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
			scales: {
				x: {
					type: 'time',
					time: {
						unit: 'day',
					},
				},
				y: {
					beginAtZero: true,
					max: max + min,
				},
			},
		},
	})
}

onMounted(() => createChart())
watch(() => props.forecast, () => createChart())
</script>
<template>
    <canvas ref="canvas" width="500" height="200"></canvas>
</template>

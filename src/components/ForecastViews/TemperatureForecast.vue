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

	const max = getMax(props.forecast, day => day.data.instant.details?.air_temperature)
	const min = getMin(props.forecast, day => day.data.instant.details?.air_temperature)

	chart.value = new Chart(canvas.value, {
		data: {
			labels: props.forecast.map((day) => day.time),
			datasets: [
				{
					type: 'bar',
					// TODO: use unit from response
					label: 'Accurate rain (mm)',
					data: props.forecast.map(
						(day) => day.data.next_1_hours?.details.precipitation_amount || 0,
					),
					barThickness: 5,
					backgroundColor: 'rgba(0, 145, 205, 1)',
					yAxisID: 'yr1',
				},
				{
					type: 'line',
					label: 'Rain over 6h (mm)',
					data: props.forecast.map(
						(day) => (day.data.next_6_hours?.details.precipitation_amount || 0) / 6,
					),
					borderColor: 'rgba(86, 160, 211, 0.3)',
					backgroundColor: 'rgba(196, 223, 246, 0.2)',
					cubicInterpolationMode: 'monotone',
					fill: 'origin',
					yAxisID: 'yr6',
				},
				{
					type: 'line',
					label: 'Temperature (°C)',
					data: props.forecast.map(
						(day) => day.data.instant.details?.air_temperature || 0,
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(244, 137, 36, 0.8)',
					backgroundColor: 'rgb(255, 200, 69, 0.5)',
					fill: "start",
					yAxisID: 'yt',
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
			scales: {
				x: {
					type: 'time',
					time: {
						unit: 'day',
					},
				},
				yt: {
					display: false,
					// TODO: set to max(data) + min(data)
					max: max + (max - min) * 2,
					min: -10,
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
</script>
<template>
	<canvas ref="canvas"></canvas>
</template>

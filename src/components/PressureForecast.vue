<script setup lang="ts">
import { ref, watch, defineProps, onMounted } from 'vue'
import type { Ref } from 'vue'
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

	const maxHumidity = getMax(props.forecast, day => day.data.instant.details?.relative_humidity)
	const minHumidity = getMin(props.forecast, day => day.data.instant.details?.relative_humidity)
	const maxPressure = getMax(props.forecast, day => day.data.instant.details?.air_pressure_at_sea_level)
	const minPressure = getMin(props.forecast, day => day.data.instant.details?.air_pressure_at_sea_level)

	chart.value = new Chart(canvas.value, {
		data: {
			labels: props.forecast.map((day) => day.time),
			datasets: [
				{
					type: 'line',
					label: 'Humidity (%)',
					data: props.forecast.map(
						(day) => day.data.instant.details?.relative_humidity || 0,
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(3, 126, 243, 1)',
					yAxisID: 'yh',
				},
				{
					type: 'line',
					label: 'Pressure (hPa)',
					data: props.forecast.map(
						(day) => day.data.instant.details?.air_pressure_at_sea_level || 0,
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
						(day) => day.data.next_1_hours?.details.precipitation_amount || 0,
					),
					barThickness: 5,
					backgroundColor: 'rgba(0, 145, 205, 0.5)',
					yAxisID: 'yr1',
				},
				{
					type: 'line',
					label: 'Rain over 6h (mm)',
					data: props.forecast.map(
						(day) => (day.data.next_6_hours?.details.precipitation_amount || 0) / 6,
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
			scales: {
				x: {
					type: 'time',
					time: {
						unit: 'day',
					},
				},
				yh: {
					beginAtZero: true,
					max: maxHumidity + minHumidity,
					min: -50,
				},
				yp: {
					beginAtZero: true,
					max: maxPressure + 50,
					min: minPressure - 20,
				},
				yr1: {
					position: 'right',
					max: 4,
					beginAtZero: true,
				},
				yr6: {
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
</script>
<template>
    <canvas ref="canvas" width="500" height="200"></canvas>
</template>

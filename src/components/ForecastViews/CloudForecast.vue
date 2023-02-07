<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import 'chartjs-adapter-date-fns'
import Chart from 'chart.js/auto'
import type { ForecastTimeStep } from '@/lib/met'
import { getMax } from '@/lib/utils'

const props = defineProps<{
	forecast: ForecastTimeStep[];
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

	// const maxCloud = getMax(props.forecast, day => day.data.instant.details?.cloud_area_fraction_medium)
	// const minCloud = getMin(props.forecast, day => day.data.instant.details?.cloud_area_fraction_medium)

	chart.value = new Chart(canvas.value, {
		data: {
			labels: props.forecast.map((day) => day.time),
			datasets: [
				{
					type: 'line',
					label: 'Cloud low',
					data: props.forecast.map(
						(day) => day.data.instant.details?.cloud_area_fraction_low || 0,
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
						(day) => day.data.instant.details?.cloud_area_fraction_medium || 0,
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
						(day) => day.data.instant.details?.cloud_area_fraction_high || 0,
					),
					cubicInterpolationMode: 'monotone',
					borderColor: 'rgba(159, 159, 163, 0.3)',
					backgroundColor: 'rgba(159, 159, 163, 0.3)',
					fill: 'origin',
					yAxisID: 'yc',
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
				// TODO: show in better way
				// {
				// 	type: 'bar',
				// 	label: 'Rain over 6h (mm)',
				// 	data: props.forecast.map(day => (day.data.next_6_hours?.details.precipitation_amount || 0) / 6),
				// 	backgroundColor: 'rgba(86, 160, 211, 0.8)',
				// 	yAxisID: 'yr6',
				// },
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				x: {
					type: 'time',
					time: {
						unit: 'day',
					},
				},
				yc: {
					display: false,
					max: 500,
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
watch(
	() => props.forecast,
	() => createChart(),
)
</script>
<template>
	<canvas ref="canvas"></canvas>
</template>

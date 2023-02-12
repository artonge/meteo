<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import Chart from 'chart.js/auto'
import type { ForecastTimeStep } from '@/lib/met'
import { getMax, getMin } from '@/lib/utils'
import { defaultChartOptions, defaultChartPlugins } from './commonConfig'
import { format, isAfter } from 'date-fns'

const props = defineProps<{
	forecast: ForecastTimeStep[]
}>()

const canvas: Ref<HTMLCanvasElement | null> = ref(null)
const chart: Ref<Chart | null> = ref(null)

const hoveredDataPoint: Ref<ForecastTimeStep> = ref(props.forecast[0])

function formatNumber(n: number = 0) {
	if (n === 0) {
		return '0.0'
	} else {
		return n.toString()
	}
}

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
</script>
<template>
	<div class="forecast">
		<div class="forecast__details">
			<div class="forecast__details__left">
				<div class="forecast__details__title">
					{{ format(new Date(hoveredDataPoint.time), 'ccc d') }}
				</div>
				<div class="forecast__details__subtitle">
					{{ format(new Date(hoveredDataPoint.time), 'p') }}
				</div>
			</div>
			<div class="forecast__details__right">
				<div class="forecast__details__data forecast__details__data">
					<span
						class="forecast__details__data__title forecast__details__data__title--temperature">Temperature</span>
					<span>{{
						hoveredDataPoint?.data.instant.details?.air_temperature
					}}°C</span>
				</div>
				<div class="forecast__details__data forecast__details__data">
					<span
						class="forecast__details__data__title forecast__details__data__title--precipitation">Précipitations</span>
					<span>{{
						formatNumber(hoveredDataPoint?.data.next_6_hours?.details.precipitation_amount)
					}} mm/h</span>
				</div>
			</div>
		</div>
		<div class="forecast__chart">
			<canvas ref="canvas"></canvas>
		</div>
	</div>
</template>
<style lang="scss" scoped>
.forecast {
	height: 100%;
	display: flex;
	flex-direction: column;

	&__details {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 24px 8px 12px;

		@media only screen and (max-width: 800px) {
			padding: 4px 8px;
		}

		&__title {
			font-size: 24px;

			@media only screen and (max-width: 800px) {
				font-size: 20px;
			}
		}

		&__subtitle {
			font-size: 20px;

			@media only screen and (max-width: 800px) {
				font-size: 16px;
			}
		}

		&__data {
			display: flex;
			gap: 8px;

			&__title {
				text-align: right;
				width: 150px;

				&--temperature {
					color: rgba(244, 137, 36, 0.8);
				}

				&--precipitation {
					color: rgba(86, 160, 211, 0.8);
				}
			}
		}
	}

	&__chart {
		flex-grow: 1;
	}
}
</style>
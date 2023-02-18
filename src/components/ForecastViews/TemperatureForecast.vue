<script setup lang="ts">
import type { ForecastTimeStep } from '@/lib/met'
import { formatNumber, getMax, getMin } from '@/lib/utils'
import ForecastLayout from './ForecastLayout.vue'
import { setupForecastView } from './forecastViewSetup'

const { hoveredDataPoint } = setupForecastView(
	{ defineProps, defineEmits },
	(forecast: ForecastTimeStep[]) => [
		{
			type: 'line',
			label: 'Humidity (%)',
			data: forecast.map(
				(dataPoint) => dataPoint.data.instant.details?.relative_humidity || 0,
			),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(3, 126, 243, 1)',
			yAxisID: 'yh',
		},
		{
			type: 'line',
			label: 'Pressure (hPa)',
			data: forecast.map(
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
			data: forecast.map(
				(dataPoint) => dataPoint.data.next_1_hours?.details.precipitation_amount || 0,
			),
			barThickness: 5,
			backgroundColor: 'rgba(0, 145, 205, 0.5)',
			yAxisID: 'yr1',
		},
		{
			type: 'line',
			label: 'Rain over 6h (mm)',
			data: forecast.map(
				(dataPoint) => (dataPoint.data.next_6_hours?.details.precipitation_amount || 0) / 6,
			),
			borderColor: 'rgba(86, 160, 211, 0.3)',
			backgroundColor: 'rgba(196, 223, 246, 0.4)',
			cubicInterpolationMode: 'monotone',
			fill: 'origin',
			yAxisID: 'yr6',
		},
		{
			type: 'line',
			label: 'Temperature (°C)',
			data: forecast.map(
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
			data: forecast.map(
				(dataPoint) => dataPoint.data.next_1_hours?.details.precipitation_amount || 0,
			),
			barThickness: 5,
			backgroundColor: 'rgba(0, 145, 205, 1)',
			yAxisID: 'yr1',
		},
		{
			type: 'line',
			label: 'Rain over 6h (mm)',
			data: forecast.map(
				(dataPoint) => (dataPoint.data.next_6_hours?.details.precipitation_amount || 0) / 6,
			),
			borderColor: 'rgba(86, 160, 211, 0.8)',
			backgroundColor: 'rgba(196, 223, 246, 0.5)',
			cubicInterpolationMode: 'monotone',
			fill: 'origin',
			yAxisID: 'yr6',
		},
	],
	(forecast: ForecastTimeStep[]) => {
		const max = getMax(forecast, dataPoint => dataPoint.data.instant.details?.air_temperature)
		const min = getMin(forecast, dataPoint => dataPoint.data.instant.details?.air_temperature)

		return {
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
		}
	}
)
</script>
<template>
	<ForecastLayout v-if="hoveredDataPoint !== null" :time="hoveredDataPoint.time">
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
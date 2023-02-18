<script setup lang="ts">
import type { ForecastTimeStep } from '@/lib/met'
import { formatNumber, getMax, getMin } from '@/lib/utils'
import ForecastLayout from './ForecastLayout.vue'
import { setupForecastView } from './forecastViewSetup'

const props = defineProps<{
	forecast: ForecastTimeStep[],
	ticker: number,
	zoom: {
		scale: number,
		offset: number,
	},
}>()

const emit = defineEmits(['update:zoom', 'update:ticker'])

const { hoveredDataPoint, canvas } = setupForecastView(
	props, emit,
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
	],
	(forecast: ForecastTimeStep[]) => {
		const maxHumidity = getMax(
			forecast,
			(dataPoint) => dataPoint.data.instant.details?.relative_humidity,
		)
		const minHumidity = getMin(
			forecast,
			(dataPoint) => dataPoint.data.instant.details?.relative_humidity,
		)
		const maxPressure = getMax(
			forecast,
			(dataPoint) => dataPoint.data.instant.details?.air_pressure_at_sea_level,
		)
		const minPressure = getMin(
			forecast,
			(dataPoint) => dataPoint.data.instant.details?.air_pressure_at_sea_level,
		)

		return {
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
		}
	}
)
</script>
<template>
	<ForecastLayout v-if="hoveredDataPoint !== null" :time="hoveredDataPoint.time">
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
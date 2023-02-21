<script setup lang="ts">
import type { Forecast } from '@/lib/open-meteo';
import { formatNumber, getMax, getMin } from '@/lib/utils'
import ForecastLayout from './ForecastLayout.vue'
import { setupForecastView } from './forecastViewSetup'

const props = defineProps<{
	forecast: Forecast,
	ticker: number,
	zoom: {
		scale: number,
		offset: number,
	},
}>()

const emit = defineEmits(['update:zoom', 'update:ticker'])

const { hoveredDataPoint, canvas } = setupForecastView(
	props, emit,
	(forecast: Forecast) => [
		{
			type: 'line',
			label: 'Humidity (%)',
			data: forecast.hourly.map(({ relativeHumidity }) => relativeHumidity),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(3, 126, 243, 1)',
			yAxisID: 'yh',
		},
		{
			type: 'line',
			label: 'Pressure (hPa)',
			data: forecast.hourly.map(({ surfacePressure }) => surfacePressure),
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
			data: forecast.hourly.map(({ precipitation }) => precipitation),
			barThickness: 5,
			backgroundColor: 'rgba(0, 145, 205, 0.5)',
			yAxisID: 'yr1',
		},
		{
			type: 'line',
			label: 'Rain over 6h (mm)',
			data: forecast.hourly.map(({ precipitation }) => (precipitation) / 6),
			borderColor: 'rgba(86, 160, 211, 0.3)',
			backgroundColor: 'rgba(196, 223, 246, 0.4)',
			cubicInterpolationMode: 'monotone',
			fill: 'origin',
			yAxisID: 'yr6',
		},
	],
	(forecast: Forecast) => {
		const minHumidity = getMin(forecast.hourly, ({ relativeHumidity }) => relativeHumidity)
		const maxHumidity = getMax(forecast.hourly, ({ relativeHumidity }) => relativeHumidity)
		const maxPressure = getMax(forecast.hourly, ({ surfacePressure }) => surfacePressure)
		const minPressure = getMin(forecast.hourly, ({ surfacePressure }) => surfacePressure)

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
			<span>{{ hoveredDataPoint.relativeHumidity }}{{ forecast.units.relativeHumidity }}</span>
		</template>
		<template #detail_2>
			<span class="forecast__details__pressure">Pression</span>
			<span>{{ formatNumber(hoveredDataPoint.surfacePressure) }}{{ forecast.units.surfacePressure }}</span>
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
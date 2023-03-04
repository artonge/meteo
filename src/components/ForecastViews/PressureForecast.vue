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
			borderColor: 'rgba(3, 126, 243, 0.8)',
			yAxisID: 'yh',
		},
		{
			type: 'line',
			label: 'Pressure (hPa)',
			data: forecast.hourly.map(({ pressureMSL }) => pressureMSL),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(253, 92, 99, 0.8)',
			backgroundColor: 'rgba(253, 92, 99, 0.2)',
			fill: 'origin',
			yAxisID: 'yp',
		},
		{
			type: 'bar',
			label: `Precipitation over the last hour`,
			data: forecast.hourly.map(({ precipitation }) => precipitation),
			barThickness: 'flex',
			backgroundColor: 'rgba(0, 145, 205, 0.7)',
			yAxisID: 'ypr',
		},
	],
	(forecast: Forecast) => {
		const minHumidity = getMin(forecast.hourly, ({ relativeHumidity }) => relativeHumidity)
		const maxHumidity = getMax(forecast.hourly, ({ relativeHumidity }) => relativeHumidity)
		const maxPressure = getMax(forecast.hourly, ({ pressureMSL }) => pressureMSL)
		const minPressure = getMin(forecast.hourly, ({ pressureMSL }) => pressureMSL)

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
			ypr: {
				display: false,
				position: 'right',
				max: 8,
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
			<span>{{ formatNumber(hoveredDataPoint.pressureMSL) }}{{ forecast.units.pressureMSL }}</span>
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
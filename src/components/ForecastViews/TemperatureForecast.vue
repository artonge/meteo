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
			label: 'Temperature',
			data: forecast.hourly.map(({ temperature }) => temperature),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(244, 137, 36, 0.8)',
			backgroundColor: 'rgb(255, 200, 69, 0.5)',
			fill: "start",
			yAxisID: 'yt',
		},
		{
			type: 'bar',
			label: `Precipitation over the last hour`,
			data: forecast.hourly.map(({ precipitation }) => precipitation),
			barThickness: 5,
			backgroundColor: 'rgba(0, 145, 205, 1)',
			yAxisID: 'yp',
		},
	],
	(forecast: Forecast) => {
		const max = getMax(forecast.hourly, ({ temperature }) => temperature)
		const min = getMin(forecast.hourly, ({ temperature }) => temperature)

		return {
			yt: {
				display: false,
				max: max + (max - min) * 2,
				min: min - (max - min) * 2,
				beginAtZero: true,
			},
			yp: {
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
			<span class="forecast__details__temperature">Temperature (ressentie)</span>
			<span>{{ hoveredDataPoint.temperature }}{{ forecast.units.temperature }} ({{ hoveredDataPoint.apparentTemperature }}{{ forecast.units.apparentTemperature }})</span>
		</template>
		<template #detail_2>
			<span class="forecast__details__precipitation">Précipitations</span>
			<span>{{ formatNumber(hoveredDataPoint.precipitation) }}{{ forecast.units.precipitation }}</span>
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
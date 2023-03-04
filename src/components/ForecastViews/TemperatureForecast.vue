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
	(forecast: Forecast) => {
		const hasSubZeroTemperatures = forecast.hourly.some(({ temperature }) => temperature <= 0)

		return [
			{
				type: 'line',
				label: 'Sub zero temperatures',
				data: hasSubZeroTemperatures ? forecast.hourly.map(({ temperature }) => temperature < 0 ? temperature : 0) : [],
				borderColor: 'rgba(3, 126, 243, 0.8)',
				backgroundColor: 'rgba(3, 126, 243, 0.2)',
				fill: "start",
				yAxisID: 'yt',
				datalabels: {
					display: false,
				}
			},
			{
				type: 'line',
				label: 'Temperature',
				data: forecast.hourly.map(({ temperature }) => temperature),
				cubicInterpolationMode: 'monotone',
				borderColor: 'rgb(244, 137, 36, 0.8)',
				backgroundColor: 'rgba(255, 200, 69, 0.2)',
				fill: "start",
				yAxisID: 'yt',
			},
			{
				type: 'bar',
				label: `Precipitation over the last hour`,
				data: forecast.hourly.map(({ precipitation }) => precipitation),
				barThickness: 'flex',
				backgroundColor: 'rgba(0, 145, 205, 0.7)',
				yAxisID: 'yp',
				datalabels: {
					display: false,
				}
			},
		]
	},
	(forecast: Forecast) => {
		const max = getMax(forecast.hourly, ({ temperature }) => temperature)
		const min = getMin(forecast.hourly, ({ temperature }) => temperature)

		return {
			yt: {
				display: false,
				suggestedMax: max + (max - min) * 2 + (20 - max),
				suggestedMin: min - (max - min) * 2,
				beginAtZero: true,
			},
			yp: {
				display: false,
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
			<span class="forecast__details__temperature">Temperature (ressentie)</span>
			<span>{{ formatNumber(hoveredDataPoint.temperature) }}{{ forecast.units.temperature }} ({{
				formatNumber(hoveredDataPoint.apparentTemperature) }}{{ forecast.units.apparentTemperature }})</span>
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
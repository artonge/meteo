<script setup lang="ts">
import { getMax, getMin } from '@/lib/utils'
import type { Forecast } from '@/lib/open-meteo';
import ForecastLayout from './ForecastLayout.vue'
import { setupForecastView } from './forecastViewSetup'

const props = defineProps<{
	forecast: Forecast,
	ticker: number,
	zoom: {
		scale: number,
		min: number,
		max: number,
	},
}>()

const emit = defineEmits(['update:zoom', 'update:ticker'])

const { hoveredDataPoint, canvas } = setupForecastView(
	props, emit,
	(forecast: Forecast) => [
		{
			type: 'line',
			label: 'Past wind',
			data: [...forecast.hourly.map(({ windSpeed }) => windSpeed).filter((_, i) => props.forecast.hourly[i].time.getTime() < Date.now())],
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(100, 100, 100, 0.8)',
			backgroundColor: 'rgba(200, 200, 200, 0.8)',
			fill: 'origin',
			yAxisID: 'y',
		},
		{
			type: 'line',
			label: 'Wind (Km/h)',
			data: forecast.hourly.map(({ windSpeed }) => windSpeed),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(48, 195, 158, 0.8)',
			backgroundColor: 'rgba(48, 195, 158, 0.2)',
			fill: 'origin',
			yAxisID: 'y',
		},
	],
	(forecast: Forecast) => {
		const max = getMax(forecast.hourly, ({ windSpeed }) => windSpeed)
		const min = getMin(forecast.hourly, ({ windSpeed }) => windSpeed)

		return {
			y: {
				display: false,
				beginAtZero: true,
				max: max + (max - min) * 0.5,
			},
		}
	}
)
</script>
<template>
	<ForecastLayout v-if="hoveredDataPoint !== null" :time="hoveredDataPoint.time">
		<template #detail_1>
			<span class="forecast__details__vitesse">{{ $t('Wind speed') }}</span>
			<span>{{ hoveredDataPoint.windSpeed }} {{ forecast.units.windSpeed }}</span>
		</template>
		<template #canvas>
			<canvas ref="canvas"></canvas>
		</template>
	</ForecastLayout>
</template>
<style lang="scss" scoped>
.forecast__details {
	&__vitesse {
		color: rgba(48, 195, 158);
	}
}
</style>
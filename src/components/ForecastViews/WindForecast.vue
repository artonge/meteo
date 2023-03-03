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
		offset: number,
	},
}>()

const emit = defineEmits(['update:zoom', 'update:ticker'])

const { hoveredDataPoint, canvas } = setupForecastView(
	props, emit,
	(forecast: Forecast) => [
		{
			type: 'line',
			label: 'Wind (Km/h)',
			data: forecast.hourly.map(({ windSpeed }) => windSpeed),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(48, 195, 158, 0.8)',
			backgroundColor: 'rgba(48, 195, 158, 0.1)',
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
			<span class="forecast__details__vitesse">Vitesse</span>
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
<script setup lang="ts">
import { getMax, getMin } from '@/lib/utils'
import type { ForecastTimeStep } from '@/lib/met'
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
			label: 'Wind (Km/h)',
			data: forecast.map(
				(dataPoint) => dataPoint.data.instant.details?.wind_speed || 0,
			),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(48, 195, 158, 1)',
			backgroundColor: 'rgba(48, 195, 158, 0.5)',
			fill: 'origin',
			yAxisID: 'y',
		},
	],
	(forecast: ForecastTimeStep[]) => {
		const max = getMax(forecast, dataPoint => dataPoint.data.instant.details?.wind_speed)
		const min = getMin(forecast, dataPoint => dataPoint.data.instant.details?.wind_speed)

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
			<span>{{ hoveredDataPoint?.data.instant.details?.wind_speed }} Km/h</span>
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
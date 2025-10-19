<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiArrowTopLeftThin } from '@mdi/js'

import { getMax, getMin } from '@/lib/utils'
import type { Forecast } from '@/lib/open-meteo'
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
			data: [...forecast.hourly.map(({ windSpeed }) => windSpeed).filter((_, i) => props.forecast.hourly[i]!.time.getTime() < Date.now())],
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
	<ForecastLayout v-if="hoveredDataPoint !== undefined" :time="hoveredDataPoint.time">
		<template #detail_1>
			<span class="forecast__details__vitesse">Vitesse</span>
			<span>{{ hoveredDataPoint.windSpeed }} {{ forecast.units.windSpeed }}</span>
		</template>
		<template #detail_2>
			<span class="forecast__details__direction">Direction</span>
			<span class="forecast__details__direction__arrow">
				<!-- +45 to compensate the arrow default direction -->
				<!-- +180 to point toward the south when direction is 0 -->
				<svg-icon :style="`transform: rotate(${45 + 180 + hoveredDataPoint.windDirection}deg)`" type="mdi" :path="mdiArrowTopLeftThin" :size="20"></svg-icon>
				<span class="forecast__details__direction__arrow__north">N</span>
			</span>
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

	&__direction {
		&__arrow {
			position: relative;
			border: 1px solid var(--color-border);
			border-radius: 100%;
			width: 25px;
			height: 25px;
			display: flex;
			align-items: center;
			justify-content: center;

			&__north {
				position: absolute;
				top: -4px;
				left: 50%;
				margin-left: -4px;
				font-size: 8px;
				width: 8px;
				height: 8px;
				line-height: 8px;
				text-align: center;
				background-color: var(--color-background);
				border-radius: 100%;
			}
		}
	}
}
</style>
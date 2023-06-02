<script setup lang="ts">
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
			label: 'Cloud low',
			data: forecast.hourly.map(({ cloudCoverLow }) => cloudCoverLow),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(159, 159, 163, 0.2)',
			backgroundColor: 'rgba(159, 159, 163, 0.2)',
			fill: 'origin',
			yAxisID: 'yc1',
		},
		{
			type: 'line',
			label: 'Cloud medium',
			data: forecast.hourly.map(({ cloudCoverMid }) => cloudCoverMid),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(159, 159, 163, 0.2)',
			backgroundColor: 'rgba(159, 159, 163, 0.2)',
			fill: 'origin',
			yAxisID: 'yc2',
		},
		{
			type: 'line',
			label: 'Cloud hight',
			data: forecast.hourly.map(({ cloudCoverHigh }) => cloudCoverHigh),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(159, 159, 163, 0.2)',
			backgroundColor: 'rgba(159, 159, 163, 0.2)',
			fill: 'origin',
			yAxisID: 'yc3',
		},
		{
			type: 'line',
			label: 'Cloud low',
			data: forecast.hourly.map(({ cloudCoverLow }) => -cloudCoverLow),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(159, 159, 163, 0.2)',
			backgroundColor: 'rgba(159, 159, 163, 0.2)',
			fill: 'origin',
			yAxisID: 'yc1',
			datalabels: {
				display: false,
			},
		},
		{
			type: 'line',
			label: 'Cloud medium',
			data: forecast.hourly.map(({ cloudCoverMid }) => -cloudCoverMid),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(159, 159, 163, 0.2)',
			backgroundColor: 'rgba(159, 159, 163, 0.2)',
			fill: 'origin',
			yAxisID: 'yc2',
			datalabels: {
				display: false,
			},
		},
		{
			type: 'line',
			label: 'Cloud hight',
			data: forecast.hourly.map(({ cloudCoverHigh }) => -cloudCoverHigh),
			cubicInterpolationMode: 'monotone',
			borderColor: 'rgba(159, 159, 163, 0.2)',
			backgroundColor: 'rgba(159, 159, 163, 0.2)',
			fill: 'origin',
			yAxisID: 'yc3',
			datalabels: {
				display: false,
			},
		},
		{
			type: 'bar',
			label: `Precipitation over the last hour`,
			data: forecast.hourly.map(({ precipitation }) => precipitation),
			barThickness: 'flex',
			backgroundColor: 'rgba(0, 145, 205, 0.5)',
			yAxisID: 'yp',
			datalabels: {
				display: false,
			},
		},
	],
	() => {
		return {
			yc1: {
				display: false,
				max: 520,
				min: -110,
			},
			yc2: {
				display: false,
				max: 315,
				min: -315,
			},
			yc3: {
				display: false,
				max: 110,
				min: -520,
			},
			yp: {
				display: false,
				position: 'right',
				max: 8,
				beginAtZero: true,
			},
		}
	},
)
</script>
<template>
	<ForecastLayout v-if="hoveredDataPoint !== null" :time="hoveredDataPoint.time">
		<template #detail_1>
			<span class="forecast__details__couverture">{{ $t('Cloud cover') }}</span>
			<span>{{ hoveredDataPoint.cloudCover }}{{ forecast.units.cloudCover }}</span>
		</template>
		<template #canvas>
			<canvas ref="canvas"></canvas>
		</template>
	</ForecastLayout>
</template>
<style lang="scss" scoped>
.forecast__details {
	&__couverture {
		color: rgba(159, 159, 163);
	}
}
</style>
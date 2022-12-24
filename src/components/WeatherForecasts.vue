<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import 'chartjs-adapter-date-fns'

import type { EventTypes, Handler } from '@vueuse/gesture'
import { useSpring, type SpringControls } from '@vueuse/motion'

import { DataApiFp, METJSONForecast } from '@/lib/met'
import type { City } from '@/lib/cities'
import TemperatureForecast from './TemperatureForecast.vue'
import CloudForecast from './CloudForecast.vue'
import PressureForecast from './PressureForecast.vue'
import WindForecast from './WindForecast.vue'

const props = defineProps<{city: City}>()
const forecastContainer = ref<HTMLDivElement>()
const forecast: Ref<METJSONForecast | null> = ref(null)
const currentIndex = ref(0)
const containerWidth = window.innerWidth
let springs: SpringControls[] = []

const dragHandler: Handler<'drag', EventTypes['drag']> = ({ dragging, movement: [mx], direction: [xDir], cancel }) => {
	if (dragging && Math.abs(mx) > containerWidth / 2) {
		currentIndex.value = Math.min(Math.max(currentIndex.value + (xDir > 0 ? -1 : 1), 0), springs.length)
		cancel()
	}

	springs.forEach((spring, i) => {
		if (i < currentIndex.value - 1 || i > currentIndex.value + 1) {
			return spring.set({ display: 'none' })
		}

		spring.set({
			x: (i - currentIndex.value) * containerWidth + (dragging ? mx : 0),
			scale: dragging ? 1 - Math.abs(mx) / containerWidth / 2 : 1,
			display: 'block',
		})
	})
}

watch(() => props.city, () => fetchForecast())
onMounted(async () => {
	await fetchForecast()

	if (forecastContainer.value === undefined) {
		return
	}

	const forecasts = Array.from(forecastContainer.value.children)
	springs = forecasts.map((forecast, i) => {
		return useSpring(
			{ x: i * containerWidth, scale: 1, display: 'none' },
			{ target: forecast as HTMLElement },
		)
	})
})

async function fetchForecast() {
	forecast.value = await DataApiFp().completeGet(
		props.city.latitude,
		props.city.longitude,
	)()
}
</script>

<template>
	<div ref="forecastContainer" v-drag="dragHandler" class="forecast-container" v-if="forecast !== null">
		<div class="forecast-container">
			<TemperatureForecast class="forecast" :forecast="forecast.properties.timeseries"/>
		</div>
		<div class="forecast-container">
			<CloudForecast class="forecast" :forecast="forecast.properties.timeseries"/>
		</div>
		<div class="forecast-container">
			<PressureForecast class="forecast" :forecast="forecast.properties.timeseries"/>
		</div>
		<div class="forecast-container">
			<WindForecast class="forecast" :forecast="forecast.properties.timeseries"/>
		</div>
	</div>
</template>

<style scoped lang="scss">
.forecast-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .forecast-container {
	position: absolute;
	width: 100%;
	height: 100%;
	touch-action: none;
	box-shadow: 0 62.5px 125px -25px rgba(50, 50, 73, 0.5), 0 37.5px 75px -37.5px rgba(0, 0, 0, 0.6);
  }
}
</style>

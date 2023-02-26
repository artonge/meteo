<script setup lang="ts">
// TODO: Improve disabled state style of header input
// TODO: Improve loading state style of geolocation button
// TODO: Add sub zero differentiator
// TODO: Fix edge detection for panning
// TODO: Increase discoverability of other panels
// TODO: Fix ticker freeze
// TODO: Improve performance
// TODO: Make it the best SPA
// TODO: Increase snap to next panel when swiping (swiping just a little snap to the next panel)
import { ref, watch, onMounted, type Ref } from 'vue'
import Flicking, { type HoldStartEvent } from '@egjs/vue3-flicking'
import '@egjs/vue3-flicking/dist/flicking.css'

import { fetchForecast, type Forecast } from '@/lib/open-meteo/api'
import type { City } from '@/lib/cities'

import TemperatureForecast from './ForecastViews/TemperatureForecast.vue'
import CloudForecast from './ForecastViews/CloudForecast.vue'
import PressureForecast from './ForecastViews/PressureForecast.vue'
import WindForecast from './ForecastViews/WindForecast.vue'

const props = defineProps<{ city: City }>()
const forecast: Ref<Forecast | null> = ref(null)
const zoom = ref({
	scale: 1,
	offset: 0,
})
const ticker = ref(0)

watch(() => props.city, () => _fetchForecast(props.city.latitude, props.city.longitude))
onMounted(async () => {
	await _fetchForecast(props.city.latitude, props.city.longitude)
})

async function _fetchForecast(latitude: number, longitude: number) {
	forecast.value = await fetchForecast(latitude, longitude)
}

function handleHoldStart(event: HoldStartEvent) {
	// Allow swiping to next or previous chart when not zoomed.
	if (zoom.value.scale === 1) {
		return
	}

	// Allow swiping to next or previous chart when on edges.
	if (zoom.value.offset === 0 || zoom.value.offset === 1) {
		return
	}

	event.stop()
}
</script>
<template>
	<Flicking v-if="forecast !== null" :options="{
		align: 'prev', circular: true, panelsPerView: 1, moveType: ['strict', { count: 1 }]
	}" @holdStart="handleHoldStart">
		<div :key="0">
			<TemperatureForecast v-model:zoom="zoom" v-model:ticker="ticker" :forecast="forecast" />
		</div>
		<div :key="1">
			<CloudForecast v-model:zoom="zoom" v-model:ticker="ticker" :forecast="forecast" />
		</div>
		<div :key="2">
			<PressureForecast v-model:zoom="zoom" v-model:ticker="ticker" :forecast="forecast" />
		</div>
		<div :key="3">
			<WindForecast v-model:zoom="zoom" v-model:ticker="ticker" :forecast="forecast" />
		</div>
	</Flicking>
</template>
<style scoped lang="scss">
.flicking-viewport {
	height: 100%;
}
</style>

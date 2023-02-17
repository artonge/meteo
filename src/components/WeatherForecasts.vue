<script setup lang="ts">
// TODO: Increase snap to next panel when swiping (swiping just a little snap to the next panel)
// TODO: Increase discoverability of other panels
// TODO: Allow to move around the graph when zoomed
// TODO: Support other weather providers
// TODO: Improve disabled state style of header input
// TODO: Improve loading state style of geolocation button
// TODO: Extend ticker to the bottom scale
// TODO: Allow to move the cursor from the bottom scale
import { ref, watch, onMounted, type Ref } from 'vue'
import Flicking from '@egjs/vue3-flicking'
import '@egjs/vue3-flicking/dist/flicking.css'

import { DataApiFp, METJSONForecast } from '@/lib/met'
import type { City } from '@/lib/cities'

import TemperatureForecast from './ForecastViews/TemperatureForecast.vue'
import CloudForecast from './ForecastViews/CloudForecast.vue'
import PressureForecast from './ForecastViews/PressureForecast.vue'
import WindForecast from './ForecastViews/WindForecast.vue'

const props = defineProps<{ city: City }>()
const forecast: Ref<METJSONForecast | null> = ref(null)
const zoom = ref({
	scale: 1,
	offset: 0,
})

watch(() => props.city, () => fetchForecast(props.city.latitude, props.city.longitude))
onMounted(async () => {
	await fetchForecast(props.city.latitude, props.city.longitude)
})

async function fetchForecast(latitude: number, longitude: number) {
	forecast.value = await DataApiFp().completeGet(
		latitude,
		longitude,
	)(fetch)
}

function handleHoldStart(event) {
	console.log("Flicking: holdStart", zoom, event)

	if (zoom.value.scale === 1) {
		return
	}

	if (zoom.value.offset === 0 || zoom.value.offset === 100) {
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
			<TemperatureForecast v-model:zoom="zoom" :forecast="forecast.properties.timeseries" />
		</div>
		<div :key="1">
			<CloudForecast v-model:zoom="zoom" :forecast="forecast.properties.timeseries" />
		</div>
		<div :key="2">
			<PressureForecast v-model:zoom="zoom" :forecast="forecast.properties.timeseries" />
		</div>
		<div :key="3">
			<WindForecast v-model:zoom="zoom" :forecast="forecast.properties.timeseries" />
		</div>
	</Flicking>
</template>
<style scoped lang="scss">
.flicking-viewport {
	height: 100%;
}
</style>

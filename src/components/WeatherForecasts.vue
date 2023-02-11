<script setup lang="ts">
// TODO: Increase snap to next panel when swiping (swiping just a little snap to the next panel)
// TODO: Increase discoverability of other panels
// TODO: Improve graph layout
// TODO: Add cursor over graphs
// TODO: Allow to zoom on the graphs
// TODO: Begin and end graphs at the edge of the screen
// TODO: Support other weather providers
// TODO: Improve disabled state style of header input
// TODO: Improve loading state style of geolocation button
// TODO: Check what karla is doing more
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
</script>
<template>
	<Flicking v-if="forecast !== null" :options="{
		align: 'prev', circular: true, panelsPerView: 1, moveType: ['strict', { count: 1 }]
	}">
		<div :key="0">
			<TemperatureForecast :forecast="forecast.properties.timeseries" />
		</div>
		<div :key="1">
			<CloudForecast :forecast="forecast.properties.timeseries" />
		</div>
		<div :key="2">
			<PressureForecast :forecast="forecast.properties.timeseries" />
		</div>
		<div :key="3">
			<WindForecast :forecast="forecast.properties.timeseries" />
		</div>
	</Flicking>
</template>
<style scoped lang="scss">
.flicking-viewport {
	height: 100%;
}
</style>

<script setup lang="ts">
// TODO: Bug from chartjs on reload when current location is restored
// TODO: Increase snap to next panel when swiping (swiping just a little snap to the next panel)
// TODO: Increase discoverability of other panels
// TODO: Improve graph layout
// TODO: Add cursor over graphs
// TODO: Allow to zoom on the graphs
// TODO: Begin and end graphs at the edge of the screen
// TODO: Support other weather providers
// TODO: Load cities in the background and display the view faster
// TODO: Check what karla is doing more
// TODO: Check rendering on mobile
// TODO: Support white theme
import { ref, watch, onMounted, type Ref } from 'vue'
import Flicking from '@egjs/vue3-flicking'
import '@egjs/vue3-flicking/dist/flicking.css'

import { DataApiFp, METJSONForecast } from '@/lib/met'
import type { City } from '@/lib/cities'

import TemperatureForecast from './TemperatureForecast.vue'
import CloudForecast from './CloudForecast.vue'
import PressureForecast from './PressureForecast.vue'
import WindForecast from './WindForecast.vue'

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
			<TemperatureForecast class="forecast" :forecast="forecast.properties.timeseries" />
		</div>
		<div :key="1">
			<CloudForecast class="forecast" :forecast="forecast.properties.timeseries" />
		</div>
		<div :key="2">
			<PressureForecast class="forecast" :forecast="forecast.properties.timeseries" />
		</div>
		<div :key="3">
			<WindForecast class="forecast" :forecast="forecast.properties.timeseries" />
		</div>
	</Flicking>
</template>
<style scoped lang="scss">
.flicking-viewport {
	height: 100%;
}

.forecast {
	width: 100% !important
}
</style>

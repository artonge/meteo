<script setup lang="ts">
import { ref, watch, onMounted, type Ref } from 'vue'

import { DataApiFp, METJSONForecast } from '@/lib/met'
import type { City } from '@/lib/cities'

import TemperatureForecast from './TemperatureForecast.vue'
import CloudForecast from './CloudForecast.vue'
import PressureForecast from './PressureForecast.vue'
import WindForecast from './WindForecast.vue'
import SlideShow from './SlideShow.vue'

const props = defineProps<{city: City}>()
const forecast: Ref<METJSONForecast | null> = ref(null)

watch(() => props.city, () => fetchForecast(props.city.latitude, props.city.longitude))
onMounted(async () => {
	await fetchForecast(props.city.latitude, props.city.longitude)
})

async function fetchForecast(latitude: number, longitude: number) {
	forecast.value = await DataApiFp().completeGet(
		latitude,
		longitude,
	)()
}
</script>
<template>
  <SlideShow class="forecasts-container" v-if="forecast !== null">
    <TemperatureForecast class="forecast" :forecast="forecast.properties.timeseries" />
    <CloudForecast class="forecast" :forecast="forecast.properties.timeseries" />
    <PressureForecast class="forecast" :forecast="forecast.properties.timeseries" />
    <WindForecast class="forecast" :forecast="forecast.properties.timeseries" />
  </SlideShow>
</template>

<style scoped lang="scss"></style>

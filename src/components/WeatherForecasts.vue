<script setup lang="ts">
import { ref, watch, onMounted, type Ref } from 'vue'
import Flicking from '@egjs/vue3-flicking'
import '@egjs/vue3-flicking/dist/flicking.css'

import { DataApiFp, METJSONForecast } from '@/lib/met'
import type { City } from '@/lib/cities'

import TemperatureForecast from './TemperatureForecast.vue'
import CloudForecast from './CloudForecast.vue'
import PressureForecast from './PressureForecast.vue'
import WindForecast from './WindForecast.vue'

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
	<Flicking v-if="forecast !== null" :options="{ circular: true }">
		<div>
			<TemperatureForecast class="forecast" :forecast="forecast.properties.timeseries" />
		</div>
		<div>
			<CloudForecast class="forecast" :forecast="forecast.properties.timeseries" />
		</div>
		<div>
			<PressureForecast class="forecast" :forecast="forecast.properties.timeseries" />
		</div>
		<div>
			<WindForecast class="forecast" :forecast="forecast.properties.timeseries" />
		</div>
	</Flicking>
</template>
<style scoped lang="scss"></style>

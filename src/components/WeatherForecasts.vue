<script setup lang="ts">
import { ref, watch, defineProps, onMounted } from 'vue'
import type { Ref } from 'vue'
import 'chartjs-adapter-date-fns'
import { DataApiFp, METJSONForecast } from '@/lib/met'
import type { City } from '@/lib/cities'
import TemperatureForecast from './TemperatureForecast.vue'
import CloudForecast from './CloudForecast.vue'
import PressureForecast from './PressureForecast.vue'
import WindForecast from './WindForecast.vue'

const props = defineProps<{city: City}>()

const forecast: Ref<METJSONForecast | null> = ref(null)

async function fetchForecast() {
	forecast.value = await DataApiFp().completeGet(
		props.city.latitude,
		props.city.longitude,
	)()
}

onMounted(() => fetchForecast())
watch(() => props.city, () => fetchForecast())
</script>
<template>
	<template v-if="forecast !== null">
		<TemperatureForecast :forecast="forecast.properties.timeseries"/>
		<CloudForecast :forecast="forecast.properties.timeseries"/>
		<PressureForecast :forecast="forecast.properties.timeseries"/>
		<WindForecast :forecast="forecast.properties.timeseries"/>
	</template>
</template>

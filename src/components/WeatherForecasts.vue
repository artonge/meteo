<script setup lang="ts">
import { ref, watch, defineProps, onMounted } from 'vue'
import type { Ref } from 'vue'
import 'chartjs-adapter-date-fns'

import { useDrag } from '@vueuse/gesture'
import { useSprings } from '@vueuse/motion'

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

const width = window.innerWidth

// const [props, api] = useSprings(4, (i: number) => ({
// 	x: i * width,
// 	scale: 1,
// 	display: 'block',
// }))

const bind = useDrag(({ active, movement: [mx], direction: [xDir], cancel }) => {
	if (active && Math.abs(mx) > width / 2) {
		index.current = clamp(index.current + (xDir > 0 ? -1 : 1), 0, pages.length - 1)
		cancel()
	}
	api.start(i => {
		if (i < index.current - 1 || i > index.current + 1) return { display: 'none' }
		const x = (i - index.current) * width + (active ? mx : 0)
		const scale = active ? 1 - Math.abs(mx) / width / 2 : 1
		return { x, scale, display: 'block' }
	})
})

onMounted(() => fetchForecast())
watch(() => props.city, () => fetchForecast())
</script>
<template>
	<template v-if="forecast !== null">
		<Swipe>
			<SwipeItem>
				<TemperatureForecast :forecast="forecast.properties.timeseries"/>
			</SwipeItem>
			<SwipeItem>
				<CloudForecast :forecast="forecast.properties.timeseries"/>
			</SwipeItem>
			<SwipeItem>
				<PressureForecast :forecast="forecast.properties.timeseries"/>
			</SwipeItem>
			<SwipeItem>
				<WindForecast :forecast="forecast.properties.timeseries"/>
			</SwipeItem>
		</Swipe>
	</template>
</template>

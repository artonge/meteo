<script setup lang="ts">
// TODO: Fix edge detection for panning
// TODO: Increase snap to next panel when swiping (swiping just a little snap to the next panel)
import { ref, watch, onMounted, type Ref } from 'vue'
import Flicking, { type HoldStartEvent, type MoveStartEvent, type WillChangeEvent } from '@egjs/vue3-flicking'
import '@egjs/vue3-flicking/dist/flicking.css'

import { fetchForecast, type Forecast } from '@/lib/open-meteo'
import type { City } from '@/lib/models'

import SvgIcon from '@jamescoyle/vue-icon'
import { mdiLoading, mdiThermometer } from '@mdi/js'
import { mdiWindTurbine } from '@mdi/js'
import { mdiWeatherCloudy } from '@mdi/js'
import { mdiWaterOutline } from '@mdi/js'

import TemperatureForecast from './ForecastViews/TemperatureForecast.vue'
import CloudForecast from './ForecastViews/CloudForecast.vue'
import PressureForecast from './ForecastViews/PressureForecast.vue'
import WindForecast from './ForecastViews/WindForecast.vue'

const props = defineProps<{ city: City }>()
const forecast: Ref<Forecast | null> = ref(null)
const zoom = ref({
	scale: 1,
	min: 0,
	max: 0,
})
const ticker = ref(0)
const currentPanelIndex = ref(0)
const flicking: Ref<Flicking | null> = ref(null)

watch(() => props.city, () => _fetchForecast(props.city.latitude, props.city.longitude))
onMounted(async () => await _fetchForecast(props.city.latitude, props.city.longitude))

async function _fetchForecast(latitude: number, longitude: number) {
	forecast.value = null
	forecast.value = await fetchForecast(latitude, longitude)
}

function handleHoldStart(event: HoldStartEvent) {
	console.debug('Flicking: hold start', {
		...zoom.value,
		dataMin: forecast.value?.hourly[0].time.getTime(),
		dataMax: forecast.value?.hourly[forecast.value.hourly.length - 1].time.getTime(),
		isMin: zoom.value.min === forecast.value?.hourly[0].time.getTime(),
		isMax: zoom.value.max === forecast.value?.hourly[forecast.value.hourly.length - 1].time.getTime(),
	})
	// Allow swiping to next or previous chart when not zoomed.
	if (zoom.value.scale === 1) {
		return
	}

	// Allow swiping to next or previous chart when on edges.
	if (zoom.value.min === forecast.value?.hourly[0].time.getTime()) {
		return
	}
	if (zoom.value.max === forecast.value?.hourly[forecast.value.hourly.length - 1].time.getTime()) {
		return
	}

	console.debug("Flicking: abort flick")
	event.stop()
}

function handleMoveStart(event: MoveStartEvent) {
	console.debug('Flicking: move start', {
		...zoom.value,
		event,
		dataMin: forecast.value?.hourly[0].time.getTime(),
		dataMax: forecast.value?.hourly[forecast.value.hourly.length - 1].time.getTime(),
		direction: event.direction,
		isMin: zoom.value.min === forecast.value?.hourly[0].time.getTime(),
		isMax: zoom.value.max === forecast.value?.hourly[forecast.value.hourly.length - 1].time.getTime(),
	})

	// Allow swiping to next or previous chart when not zoomed.
	if (zoom.value.scale === 1) {
		return
	}

	// Always allow when is is a programmatic move.
	if (!event.isTrusted) {
		return
	}

	if (zoom.value.min === forecast.value?.hourly[0].time.getTime() && event.direction === 'NEXT') {
		console.debug("Flicking: abort flick")
		event.stop()
	}

	if (zoom.value.max === forecast.value?.hourly[forecast.value.hourly.length - 1].time.getTime() && event.direction === 'PREV') {
		console.debug("Flicking: abort flick")
		event.stop()
	}
}

function handlePanelChanged({index}: WillChangeEvent) {
	currentPanelIndex.value = index
}
</script>
<template>
	<Flicking v-if="forecast !== null" ref="flicking" :options="{
		align: 'prev',
		circular: true,
		panelsPerView: 1,
		moveType: ['strict', { count: 1 }],
		inputType: ['pointer'],
	}" @holdStart="handleHoldStart" @moveStart="handleMoveStart" @willChange="handlePanelChanged">
		<div :key="0">
			<TemperatureForecast v-model:zoom="zoom" v-model:ticker="ticker" :forecast="forecast" />
		</div>
		<div :key="1">
			<WindForecast v-model:zoom="zoom" v-model:ticker="ticker" :forecast="forecast" />
		</div>
		<div :key="2">
			<CloudForecast v-model:zoom="zoom" v-model:ticker="ticker" :forecast="forecast" />
		</div>
		<div :key="3">
			<PressureForecast v-model:zoom="zoom" v-model:ticker="ticker" :forecast="forecast" />
		</div>
	</Flicking>
	<svg-icon v-else type="mdi" :path="mdiLoading" class="loading" :size="64"></svg-icon>

	<nav class="bottom-menu">
		<button aria-label="Go to temperature chart" @click="flicking?.moveTo(0)" class="menu-item" :class="{selected: currentPanelIndex === 0}">
			<svg-icon type="mdi" :path="mdiThermometer"></svg-icon>
			Temperature
		</button>
		<button aria-label="Go to wind chart" @click="flicking?.moveTo(1)" class="menu-item" :class="{selected: currentPanelIndex === 1}">
			<svg-icon type="mdi" :path="mdiWindTurbine"></svg-icon>
			Wind
		</button>
		<button aria-label="Go to cloud chart" @click="flicking?.moveTo(2)" class="menu-item" :class="{selected: currentPanelIndex === 2}">
			<svg-icon type="mdi" :path="mdiWeatherCloudy"></svg-icon>
			Cloud
		</button>
		<button aria-label="Go to pressure chart" @click="flicking?.moveTo(3)" class="menu-item" :class="{selected: currentPanelIndex === 3}">
			<svg-icon type="mdi" :path="mdiWaterOutline"></svg-icon>
			Pressure
		</button>
	</nav>
</template>
<style scoped lang="scss">
.flicking-viewport {
	flex-grow: 1;
}

.loading {
	align-self: center;
	flex-grow: 1;
}

.bottom-menu {
	display: flex;
	width: 100%;
	height: 50px;
	justify-content: space-around;
	align-items: center;

	.menu-item {
		flex-grow: 1;
		flex-basis: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		border-left: 1px solid var(--color-border);
		height: 100%;
		padding: 8px;

		&.selected {
			background-color: var(--color-background-secondary);
		}
	}
}
</style>

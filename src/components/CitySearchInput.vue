<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { StorageSerializers, useStorage, useGeolocation } from '@vueuse/core'
// @ts-ignore
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiLoading, mdiCrosshairs } from '@mdi/js'

import { debounce } from 'debounce'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

import { searchCities, type City } from '@/lib/cities'

const emits = defineEmits<{ (e: 'citySelected', city: City): void }>()

const selectedCity: Ref<City | null> = useStorage('selectedCity', null, undefined, { serializer: StorageSerializers.object })
const foundCities: Ref<City[]> = ref([])
const loadingCurrentLocation = ref(false)
const { coords, resume, pause, isSupported } = useGeolocation({ immediate: false })

if (selectedCity.value !== null) {
	if (selectedCity.value.name === 'Current location') {
		handleGeolocationRequest()
	} else {
		emits('citySelected', selectedCity.value)
	}
}

function searchCity(query: string, toggleLoading: Function) {
	if (query === '') {
		return
	}

	toggleLoading(true)
	// Need to wrap into a timeout as search city is synchronous.
	// So vue do not render before the response and the loading icon is not displayed.
	setTimeout(() => {
		foundCities.value = searchCities(query)
		console.debug('Found cities:', foundCities.value)
		toggleLoading(false)
	})
}

const debouncedSearchCity = debounce(searchCity, 200)

watch(selectedCity, () => {
	if (selectedCity.value !== null) {
		console.debug('City selected', selectedCity.value)
		emits('citySelected', selectedCity.value)
	}
})

watch(coords, () => {
	console.debug('Coords changed', coords.value)
	pause()
	loadingCurrentLocation.value = false
	selectedCity.value = {
		id: -1,
		name: 'Current location',
		latitude: coords.value.latitude,
		longitude: coords.value.longitude,
		countryCode: `${coords.value.latitude.toFixed(3)}, ${coords.value.longitude.toFixed(3)}`,
		population: 0,
	}
})

function handleGeolocationRequest() {
	console.debug('Requesting geolocation')
	resume()
	loadingCurrentLocation.value = true
}
</script>
<template>
	<div class="location-input">
		<v-select class="city-select" :options="foundCities" :filterable="false" v-model="selectedCity"
			placeholder="Search a city name. Ex: Paris" @search="debouncedSearchCity"
			:getOptionLabel="(city: City) => `${city.name} (${city.countryCode})`">
			<template #no-options> Type to search a city</template>
		</v-select>
		<button v-if="isSupported" class="geolocation-button" @click="handleGeolocationRequest">
			<svg-icon v-if="loadingCurrentLocation" type="mdi" :path="mdiLoading"></svg-icon>
			<svg-icon v-else type="mdi" :path="mdiCrosshairs"></svg-icon>
		</button>
	</div>
</template>
<style scoped lang="scss">
.location-input {
	display: flex;
	width: 100%;
	background-color: var(--color-background-ternary);
	border-radius: 6px;

	.v-select {
		flex-grow: 1;
		width: 0;

		:deep(.vs__search) {
			height: 60px;
			font-size: 24px;
			margin-top: 6px;
			color: var(--color-text);
		}

		:deep(.vs__selected-options) {
			width: calc(100% - 30px);
		}

		:deep(.vs__selected) {
			font-size: 24px;
			color: var(--color-primary);
			width: calc(100% - 20px);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		&.vs--open,
		&.vs--loading {
			:deep(.vs__selected) {
				top: 50%;
				margin-top: -16px;
			}
		}

		:deep(.vs__actions) {
			margin-right: 4px;

			.vs__clear {
				scale: 1.5;
				fill: var(--color-text);
			}

			.vs__open-indicator {
				display: none;
				color: var(--color-text);
			}

			.vs__spinner {
				border-top-color: var(--color-border);
				border-right-color: var(--color-border);
				border-bottom-color: var(--color-border);
				border-left-color: var(--color-text);
			}
		}

		&.vs--loading {
			:deep(.vs__clear) {
				display: none;
			}
		}

		:deep(.vs__dropdown-menu) {
			background-color: var(--color-background-ternary);
			padding: 20px 8px;

			.vs__dropdown-option {
				font-size: 20px;
				border-radius: 8px;
				padding: 4px 8px;
				border: 2px solid transparent;
			}

			.vs__dropdown-option--highlight {
				border: 2px solid var(--color-primary);
				background-color: var(--color-primary-transparent);
			}
		}
	}

	.geolocation-button {
		width: 72px;
		flex-shrink: 0;
	}
}
</style>

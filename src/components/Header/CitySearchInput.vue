<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { StorageSerializers, useStorage, useGeolocation } from '@vueuse/core'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiLoading, mdiCrosshairs, mdiClose } from '@mdi/js'

import debounce from 'debounce'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

import { searchLocation } from '../../lib/open-meteo'
import type { City } from '../../lib/models'
import Deselect from './Deselect.vue'

const emits = defineEmits<{ (e: 'citySelected', city: City): void }>()

const loading = ref(0)
const selectedCity: Ref<City | null> = useStorage('selectedCity', null, undefined, { serializer: StorageSerializers.object })
const cityHistory: Ref<City[]> = useStorage('cityHistory', [], undefined, { serializer: StorageSerializers.object })
const foundCities: Ref<City[]> = ref([])
const searchResults = computed(() => {
	if (foundCities.value.length > 0) {
		return foundCities.value
	} else {
		return cityHistory.value.slice(0, 5)
	}
})
const loadingCurrentLocation = ref(false)
const { coords, resume, pause, isSupported, error: coordsError } = useGeolocation({ immediate: false })

if (selectedCity.value !== null) {
	if (selectedCity.value.name === 'Current location') {
		handleGeolocationRequest()
	} else {
		emits('citySelected', selectedCity.value)
	}
}

async function searchCity(query: string) {
	if (query === '') {
		return
	}

	loading.value++
	foundCities.value = await searchLocation(query)
	console.debug('Found cities:', foundCities.value)
	loading.value--
}

const debouncedSearchCity = debounce(searchCity, 500)

watch(selectedCity, (newValue, oldValue) => {
	console.debug('City selected', selectedCity.value, newValue, oldValue, newValue === oldValue)

	// The watcher is triggered twice for unknown reason. This make sure that we do not emit 'citySelected' twice
	if (newValue !== null && oldValue !== null) {
		const { latitude: nlat, longitude: nlon } = newValue
		const { latitude: olat, longitude: olon } = oldValue

		if (nlat === olat && nlon === olon) {
			return
		}
	}

	if (selectedCity.value !== null) {
		const index = cityHistory.value.findIndex(city => city.id === selectedCity.value?.id)
		// Remove any old occurrence of the city in history.
		if (index !== -1) {
			cityHistory.value.splice(index, 1)
		}
		// Add selection to the top of the history
		if (selectedCity.value.id !== -1) {
			cityHistory.value.unshift(selectedCity.value)
		}
		foundCities.value = []
		emits('citySelected', selectedCity.value)
	}
})

watch(coords, () => {
	console.debug('Coords changed', coords.value)
	pause()
	loadingCurrentLocation.value = false
	selectedCity.value = {
		id: -1,
		name: `${coords.value.latitude.toFixed(1)}, ${coords.value.longitude.toFixed(1)}`,
		latitude: coords.value.latitude,
		longitude: coords.value.longitude,
		countryCode: 'Current location',
		population: 0,
	}
})

watch(coordsError, () => {
	loadingCurrentLocation.value = false
	pause()
	alert(coordsError.value?.message)
})

function handleGeolocationRequest() {
	console.debug('Requesting geolocation')
	resume()
	loadingCurrentLocation.value = true
}
</script>
<template>
	<div class="location-input">
		<v-select class="city-select" :options="searchResults" :filterable="false" v-model="selectedCity"
			:components="{ Deselect }" placeholder="Enter a city name. Ex: Paris"
			:loading="loading !== 0" @search="debouncedSearchCity"
			:getOptionLabel="(city: City) => `${city.name} (${city.countryCode})`">
			<template #option="option: City">
				{{ option.name }} ({{ option.countryCode }})
				<button v-if="foundCities.length === 0"
					@click.prevent="cityHistory.splice(cityHistory.findIndex(city => city.id === option.id), 1)">
					<svg-icon type="mdi" :path="mdiClose"></svg-icon>
				</button>
			</template>

			<template #no-options> Type to search a city</template>
			<template #spinner="{ loading }">
				<svg-icon v-if="loading" type="mdi" :path="mdiLoading" class="loading"></svg-icon>
			</template>
		</v-select>
		<button v-if="isSupported" class="geolocation-button" @click="handleGeolocationRequest"
			aria-label="Use device location">
			<svg-icon v-if="loadingCurrentLocation" type="mdi" :path="mdiLoading" class="loading"></svg-icon>
			<svg-icon v-else type="mdi" :path="mdiCrosshairs"></svg-icon>
		</button>
	</div>
</template>
<style scoped lang="scss">
.location-input {
	display: flex;
	width: 100%;

	:deep(.v-select) {
		flex-grow: 1;
		width: 0;

		&.vs--loading .vs__clear {
			display: none;
		}

		&.vs--open .vs__dropdown-toggle {
			border-radius: 6px 0px 0px 0px;
			border: 2px solid var(--color-primary);
		}

		&:not(.vs--open) .vs__dropdown-toggle {
			transition: border-radius 250ms;
		}

		.vs__dropdown-toggle {
			border: 2px solid var(--color-border);
			border-radius: 6px 0px 0px 6px;
			background-color: var(--color-background-ternary);
			padding-bottom: 0;

			.vs__selected-options {
				width: calc(100% - 30px);
				align-items: center;
				height: 60px;

				.vs__search,
				.vs__selected {
					margin-top: 0;
					font-size: 24px;

				}

				.vs__search {
					color: var(--color-text);
				}


				.vs__selected {
					color: var(--color-primary-contrasted);
					width: calc(100% - 20px);
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}

			.vs__actions {
				margin-right: 4px;
				padding-top: 0;

				.vs__clear {
					margin-top: 4px;
					height: 24px;
				}

				.vs__open-indicator {
					display: none;
					color: var(--color-text);
				}
			}
		}

		.vs__dropdown-menu {
			background-color: var(--color-background-ternary);
			padding: 20px 8px;
			border: 2px solid var(--color-primary);
			border-top: 0px;
			margin-top: 1px;

			.vs__dropdown-option {
				font-size: 20px;
				border-radius: 8px;
				padding: 4px 8px;
				border: 2px solid transparent;
				display: flex;
				justify-content: space-between;
				align-items: center;

				&--highlight {
					border: 2px solid var(--color-primary);
					background-color: var(--color-primary-transparent);
					color: var(--color-text);
				}

				button {
					width: 24px;
					height: 24px;
					background-color: transparent;
				}
			}
		}
	}

	.geolocation-button {
		width: 72px;
		flex-shrink: 0;
		border: 2px solid var(--color-border);
		border-radius: 0px 6px 6px 0px;
		border-left: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}
</style>

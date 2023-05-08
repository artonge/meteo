<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { StorageSerializers, useStorage, useGeolocation } from '@vueuse/core'
// @ts-ignore
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiLoading, mdiCrosshairs } from '@mdi/js'

import { debounce } from 'debounce'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

import { createCitiesIndex, fetchCities, isCitiesIndexLoaded, searchCities, type City } from '@/lib/cities'
import Deselect from './Deselect.vue'

const emits = defineEmits<{ (e: 'citySelected', city: City): void }>()

const initialLoading = ref(true)
const loading = ref(false)
const selectedCity: Ref<City | null> = useStorage('selectedCity', null, undefined, { serializer: StorageSerializers.object })
const foundCities: Ref<City[]> = ref([])
const loadingCurrentLocation = ref(false)
const { coords, resume, pause, isSupported, error: coordsError } = useGeolocation({ immediate: false })

if (selectedCity.value !== null) {
	if (selectedCity.value.name === 'Current location') {
		handleGeolocationRequest()
	} else {
		emits('citySelected', selectedCity.value)
	}
}

onMounted(async () => {
	await fetchCities()
	initialLoading.value = false
})


let savedQuery = ''
async function handleSelectOpen() {
	await createCitiesIndex()

	if (savedQuery !== '') {
		console.debug('Rerun query after index loaded:', savedQuery)
		searchCity(savedQuery)
	}
}

function searchCity(query: string) {
	if (query === '') {
		return
	}

	loading.value = true

	if (!isCitiesIndexLoaded()) {
		console.debug('Index not loaded, saving query:', query)
		savedQuery = query
		return
	}

	// Need to wrap into a timeout as search city is synchronous.
	// So vue do not render before the response and the loading icon is not displayed.
	setTimeout(() => {
		foundCities.value = searchCities(query)
		console.debug('Found cities:', foundCities.value)
		loading.value = false
	})
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
		<v-select class="city-select" :options="foundCities" :filterable="false" v-model="selectedCity"
			:components="{ Deselect }" :disabled="initialLoading" placeholder="Search a city name. Ex: Paris"
			:loading="loading" @open="handleSelectOpen" @search="debouncedSearchCity"
			:getOptionLabel="(city: City) => `${city.name} (${city.countryCode})`">
			<template #no-options> Type to search a city</template>
			<template #spinner="{ loading }">
				<svg-icon v-if="loading" type="mdi" :path="mdiLoading" class="loading"></svg-icon>
			</template>
		</v-select>
		<button v-if="isSupported" class="geolocation-button" @click="handleGeolocationRequest" aria-label="Use device location">
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

				&--highlight {
					border: 2px solid var(--color-primary);
					background-color: var(--color-primary-transparent);
					color: var(--color-text);
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

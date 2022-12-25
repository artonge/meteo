<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { StorageSerializers, useStorage } from '@vueuse/core'

import { debounce } from 'debounce'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

import { searchCities, type City } from '@/lib/cities'

const emits = defineEmits<{(e: 'citySelected', city: City): void}>()

const selectedCity: Ref<City|null> = useStorage('selectedCity', null, undefined, { serializer: StorageSerializers.object })
const foundCities: Ref<City[]> = ref([])

if (selectedCity.value !== null) {
	emits('citySelected', selectedCity.value)
}

function searchCity(query: string, toggleLoading: Function) {
	if (query === '') {
		return
	}

	toggleLoading(true)
	// Need to wrap into a timeout as search city is synchronous.
	// So vue won't update and the loading icon won't be displayed.
	setTimeout(() => {
		foundCities.value = searchCities(query)
		console.log('Found cities:', foundCities.value)
		toggleLoading(false)
	})
}

const debouncedSearchCity = debounce(searchCity, 200)

function citySelected(city: City) {
	console.log('City selected', city)
	emits('citySelected', city)
}
</script>
<template>
  <v-select
    class="city-select"
    :options="foundCities"
    :filterable="false"
    v-model="selectedCity"
    placeholder="Search a city name. Ex: Paris"
    @search="debouncedSearchCity"
    @option:selected="citySelected"
    :getOptionLabel="(city: City) => `${city.name} (${city.countryCode})`"
  >
    <template #no-options> Type to search a city</template>
  </v-select>
</template>
<style scoped lang="scss">
.v-select {
  border-color: none;
  background-color: var(--color-ternary-background);
  border-radius: 6px;
  width: 50%;

  @media only screen and (max-width: 1000px) {
    width: 75%;
  }

  @media only screen and (max-width: 800px) {
    width: 100%;
  }

  :deep(.vs__search) {
    height: 60px;
    font-size: 24px;
    margin-top: 6px;
    color: var(--color-text);
  }

  :deep(.vs__selected) {
    font-size: 24px;
    color: var(--color-primary);
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
    background-color: var(--color-ternary-background);
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
</style>

<script setup lang="ts">
import { ref, defineEmits, onMounted, watch } from 'vue'
import type { Ref } from 'vue'

import { findCity, getCityList, type City } from '@/lib/cities'

const emits = defineEmits<{(e: 'citySelected', city: City): void}>()

const cityList: Ref<string[]> = ref([])
const citySearch = ref('')

onMounted(async() => {
	cityList.value = await getCityList()
})

watch(citySearch, (value) => {
	const city = findCity(value)
	if (city !== undefined) {
		emits('citySelected', city)
	}
})
</script>

<template>
  <label for="city-choice">
    <input
      v-model="citySearch"
      list="cities"
      id="cities-choice"
      name="cities-choice"
  placeholder="Search a city name. Ex: Paris"
    />

    <datalist id="cities">
      <option
        v-for="city in cityList"
        :key="city"
      >
        {{city}}
      </option>
    </datalist>
  </label>
</template>
<style scoped lang="scss">
label {
  width: 100%;

  input {
    border: 1px solid gray;
    border-radius: 8px;
    width: 100%;
    height: 45px;
    padding: 0px 12px;
  }
}
</style>

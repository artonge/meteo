<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { citiesLoaded, createCitiesIndex, fetchCities } from './lib/cities'

const loading = ref(true)
const state = ref('')

onMounted(async () => {
	if (!(await citiesLoaded())) {
		state.value = 'Loading cities...'
		await fetchCities()
	}

	state.value = 'Creating cities index...'
	await createCitiesIndex()
	loading.value = false
})

</script>
<template>
	<RouterView />
</template>

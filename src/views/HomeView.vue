<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";
import type { City } from "@/lib/cities";
import Header from "@/components/Header/Header.vue";
import CitySearchInput from "@/components/Header/CitySearchInput.vue";
import WeatherForecasts from "@/components/WeatherForecasts.vue";

const selectedCity: Ref<City | null> = ref(null);
</script>
<template>
	<Header>
		<CitySearchInput @citySelected="(city) => (selectedCity = city)" />
	</Header>

	<main>
		<WeatherForecasts v-if="selectedCity !== null" :city="selectedCity" />
	</main>
</template>
<style scoped lang="scss">
main {
	height: calc(100dvh - 80px);
}
</style>

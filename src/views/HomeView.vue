<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";
import type { City } from "@/lib/models.js";
import MainHeader from "@/components/Header/MainHeader.vue";
import CitySearchInput from "@/components/Header/CitySearchInput.vue";
import WeatherForecasts from "@/components/WeatherForecasts.vue";

const selectedCity: Ref<City | null> = ref(null);
</script>
<template>
	<MainHeader>
		<CitySearchInput @citySelected="(city) => (selectedCity = city)" />
	</MainHeader>

	<main>
		<WeatherForecasts v-if="selectedCity !== null" :city="selectedCity" />
	</main>
</template>
<style scoped lang="scss">
main {
	height: calc(100dvh - 80px);
	display: flex;
	flex-direction: column;
}
</style>

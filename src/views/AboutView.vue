<script setup>
import { computed, defineModel } from 'vue'
import { storeToRefs } from 'pinia'

import draggable from 'vuedraggable'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiArrowLeft } from '@mdi/js'
import { mdiRestore } from '@mdi/js';

import { useWeatherModelsStore } from "@/stores/weatherModels"

const store = useWeatherModelsStore()
const { modelsDict } = storeToRefs(store)
</script>
<template>
	<header>
		<RouterLink to="/">
			<svg-icon type="mdi" :path="mdiArrowLeft"></svg-icon>
		</RouterLink>
	</header>
	<main>
		<div class="about-models">
			<h3>Models</h3>
			<draggable
				v-model="modelsDict"
				@update:modelValue="(newlyOrderedModels) => store.setOrder(newlyOrderedModels.map(model => model.key))"
				group="people"
				@start="drag=true"
				@end="drag=false"
				item-key="key">
					<template #item="{element}">
						<div>{{element.label}}</div>
					</template>
			</draggable>
			<button class="about-models-restore-button" @click="store.resetOrder()">
				<svg-icon type="mdi" :path="mdiRestore"></svg-icon>
				Restore
			</button>
		</div>
	</main>
</template>
<style scoped lang="scss">
header {
	width: 100%;
	height: 80px;
	padding: 12px;
	display: flex;
	align-items: center;
	background-color: var(--color-background-secondary);
	box-sizing: border-box;

	@media only screen and (max-width: 800px) {
		padding: 4px;
	}
}

main {
	padding: 20px 50px;

	.about-models {
		display: flex;
		gap: 16px;
		align-items: start;

		h3 {
			margin: 0;
		}

		&-restore-button {
			display: flex;
			align-items: center;
			font-size: 16px;
		}
	}
}
</style>

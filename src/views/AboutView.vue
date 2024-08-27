<script setup lang="ts">
import { storeToRefs } from 'pinia'

import draggable from 'vuedraggable'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiArrowLeft } from '@mdi/js'
import { mdiRestore } from '@mdi/js';

import { useWeatherModelsStore, type ModelInfo } from "@/stores/weatherModels"

const store = useWeatherModelsStore()
const { models } = storeToRefs(store)

let drag = false
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
			<div>
				<draggable
					v-model="models"
					@update:modelValue="(newlyOrderedModels) => store.setOrder(newlyOrderedModels.map((model: ModelInfo) => model.key))"
					group="people"
					@start="drag=true"
					@end="drag=false"
					item-key="key">
						<template #item="{element}">
							<div>
								<label>
									<input type="checkbox" :checked="element.enabled" @change="store.toggleModel(element.key)">
									{{element.label}}
								</label>
							</div>
						</template>
				</draggable>
				<button class="about-models-restore-button" @click="store.resetModels()">
					<svg-icon type="mdi" :path="mdiRestore"></svg-icon>
					Restore
				</button>
			</div>
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
	height: calc(100dvh - 80px);
	display: flex;
	padding: 20px 50px;
	box-sizing: border-box;
	overflow: scroll;

	@media only screen and (max-width: 800px) {
		padding: 10px;
	}

	.about-models {
		display: flex;
		gap: 16px;
		align-items: start;
		height: fit-content;

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

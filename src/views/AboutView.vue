<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, type Ref } from 'vue';

import draggable from 'vuedraggable'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiArrowLeft, mdiClose, mdiDragHorizontal, mdiPlus, mdiTrashCan } from '@mdi/js'
import { mdiRestore } from '@mdi/js';

import { useWeatherModelsStore, type ModelInfo } from "@/stores/weatherModels"
import { useConfigStore } from "@/stores/config"

const weatherModelStore = useWeatherModelsStore()
const configStore = useConfigStore()
const { enabledModels, disabledModels } = storeToRefs(weatherModelStore)
const buildDate = BUILD_DATE

const addModelDialog: Ref<HTMLDialogElement | null> = ref(null)

let drag = ref<boolean>(false)
</script>
<template>
	<header>
		<RouterLink to="/">
			<svg-icon type="mdi" :path="mdiArrowLeft"></svg-icon>
		</RouterLink>
	</header>
	<main>
		<div class="about-section models">
			<h3>Models</h3>
			<div>
				<draggable
					v-model="enabledModels"
					@update:modelValue="(newlyOrderedModels: ModelInfo[]) => weatherModelStore.setOrder(newlyOrderedModels.map((model: ModelInfo) => model.key))"
					group="people"
					@start="drag = true"
					@end="drag = false"
					item-key="key">
						<template #item="{ element }">
							<div class="models__enabled-model">
								<button class="models__enabled-model__drag-button"><svg-icon type="mdi" :path="mdiDragHorizontal"></svg-icon></button>
								<span class="models__enabled-model__label">{{ element.label }}</span>
								<button class="models__enabled-model__remove-button" @click="weatherModelStore.toggleModel(element.key)"><svg-icon type="mdi" :path="mdiTrashCan"></svg-icon></button>
							</div>
						</template>
				</draggable>

				<button class="models__restore-button" @click="addModelDialog?.showModal()">
					<svg-icon type="mdi" :path="mdiPlus"></svg-icon>
					Add
				</button>
				<button class="models__restore-button" @click="weatherModelStore.resetModels()">
					<svg-icon type="mdi" :path="mdiRestore"></svg-icon>
					Restore
				</button>

				<dialog class="models__add-model-dialog" ref="addModelDialog">
					<button class="models__add-model-dialog__close-button" @click="addModelDialog?.close()"><svg-icon type="mdi" :path="mdiClose"></svg-icon></button>
					<div class="models__add-model-dialog__models-list">
						<div class="models__add-model-dialog__available-model" v-for="model in disabledModels" :key="model.key">
							{{ model.label }}
							<button @click="weatherModelStore.toggleModel(model.key)"><svg-icon type="mdi" :path="mdiPlus"></svg-icon></button>
						</div>
					</div>
				</dialog>
			</div>
		</div>
		<div class="about-section build-date">
			<h3>Forecast length</h3>
			<div>
				<input type="number" v-model.number="configStore.forecastLength" min="1" max="16" /> days
			</div>
		</div>
		<div class="about-section build-date">
			<h3>Build date</h3> {{ buildDate }}
		</div>
		<div class="about-section github-link">
			<h3>Source code</h3> <a href="https://github.com/artonge/meteo" target="_blank">GitHub</a>
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
	display: flex;
	flex-direction: column;
	gap: 20px;
	height: calc(100dvh - 80px);
	padding: 20px 50px;
	box-sizing: border-box;
	overflow: scroll;

	@media only screen and (max-width: 800px) {
		padding: 10px;
	}

	.about-section {
		display: flex;
		align-items: start;
		gap: 16px;
		height: fit-content;

		h3 {
			margin: 0;
		}
	}

	.models {
		&__restore-button {
			display: flex;
			align-items: center;
			font-size: 16px;
		}

		&__enabled-model {
			display: flex;
			align-items: center;
			gap: 8px;
			border: 1px solid var(--color-border);
			border-radius: 4px;
			margin-top: 4px;

			&__label {
				flex-grow: 1;
			}
		}

		&__add-model-dialog {
			background-color: var(--color-background-secondary);
			border: 1px solid var(--color-border);
			color: var(--color-text);
			height: 75%;
			padding: 24px 16px;

			&__models-list {
				overflow: scroll;
				height: 100%;
			}

			&__close-button {
				position: absolute;
				top: 0;
				right: 0;
				background-color: var(--color-background-secondary);
				border: none;
				padding: 4px;
			}

			&__available-model {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 6px;
				border-bottom: 1px solid var(--color-border);

				&:last-child {
					border-bottom: none;
				}

				button {
					background-color: var(--color-background-secondary);
					border: 1px solid var(--color-border);
					border-radius: 4px;
					padding: 1px;
				}
			}
		}
	}
}
</style>

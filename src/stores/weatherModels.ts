import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'


const models = {
	'meteofrance_arome_france_hd': "Météo-France AROME France HD",
	'meteofrance_seamless': "Météo-France Seamless",
	'metno_nordic': "MET Norway Nordic",
	'best_match': "Best match",
}

type ModelKeys = keyof typeof models

const defaultEnabledModels: ModelKeys[] = [
	'meteofrance_arome_france_hd',
	'meteofrance_seamless',
	'metno_nordic',
	'best_match',
]

export const useWeatherModelsStore = defineStore('weatherModels', {
	state: () => ({
		order: useLocalStorage('modelsOrder', Object.keys(models) as ModelKeys[]),
		enabled: useLocalStorage('enabledModels', defaultEnabledModels),
	}),
	getters: {
		models(): {key: ModelKeys, label: string, enabled: boolean}[] {
			return this.order
				.map(key => ({
					key,
					label: models[key],
					enabled: this.enabled.includes(key)
				}))
		},
		modelsKeys(): ModelKeys[] {
			return this.order
		},
	},
	actions: {
		setOrder(newOrder: ModelKeys[]) {
			this.order = newOrder
		},
		resetModels() {
			this.order = Object.keys(models) as ModelKeys[]
			this.enabled = defaultEnabledModels
		},
		toggleModel(modelKey: ModelKeys) {
			if (this.enabled.includes(modelKey)) {
				this.enabled = this.enabled.filter(key => key !== modelKey)
			} else {
				this.enabled = [...this.enabled, modelKey]
			}
		},
	}
})
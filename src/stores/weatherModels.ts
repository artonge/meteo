import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useWeatherModelsStore = defineStore('weatherModels', {
	state: () => ({
		_models: {
			'meteofrance_arome_france_hd': "Météo-France AROME France HD",
			'meteofrance_seamless': "Météo-France Seamless",
			'metno_nordic': "MET Norway Nordic",
			'best_match': "Best match",
		},
		order: useLocalStorage('modelsOrder', [
			'meteofrance_arome_france_hd',
			'meteofrance_seamless',
			'metno_nordic',
			'best_match',
		])
	}),
	getters: {
		models() {
			return this.order.reduce((acc, key) => {
				acc[key] = this._models[key]
				return acc
			}, {})
		},
		modelsDict() {
			return this.order.map(key => ({ key, label: this._models[key] }))
		},
		modelsKeys() {
			return this.order
		},
	},
	actions: {
		setOrder(newOrder: string[]) {
			this.order = newOrder
		},
		resetOrder() {
			this.order = Object.keys(this._models)
		},
	}
})
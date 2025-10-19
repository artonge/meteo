import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useConfigStore = defineStore('config', () => {
	const forecastLength = useLocalStorage('forecastLength', 5)

	return {
		forecastLength: forecastLength,
	}
})
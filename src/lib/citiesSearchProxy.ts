import type { City } from "./models"

const worker = new Worker(new URL('./citiesSearchWorker.ts', import.meta.url), { type: "module" })

const promises: { [key: string]: { resolve: Function, reject: Function } } = {}

worker.onmessage = function handleWorkerMessage({ data: { key, value } }: { data: { key: string, value: any } }) {
	promises[key].resolve(value)
	delete promises[key]
}

function callMethod(method: string, params?: any): Promise<any> {
	return new Promise((resolve, reject) => {
		const key = (Math.random() + 1).toString(36).substring(7)
		worker.postMessage({ key, method, params })
		promises[key] = { resolve, reject }
	})
}

export function createCitiesIndex(): Promise<void> {
	return callMethod('createCitiesIndex')
}

export function fetchCities(): Promise<void> {
	return callMethod('fetchCities')
}

export function isCitiesIndexLoaded(): Promise<boolean> {
	return callMethod('isCitiesIndexLoaded')
}

export function searchCities(searchQuery: string): Promise<City[]> {
	return callMethod('searchCities', searchQuery)
}

import Dexie, { type Table } from 'dexie'
import Fuse from 'fuse.js'
import type { City } from './models'

/**
 * The city list is a 16Mb file with 140777 entries. So it is an heavy task to fetch them and search them.
 * This file helps with manipulating cities.
 * You can fetch the cities with `fetchCities`.
 * This will also store them in indexedDB storage with Dexie (https://dexie.org) to avoid fetching them again in the futur.
 * You can create an index of the cities with `createCitiesIndex` that will use Fuse.js (https://fusejs.io).
 * You can then search cities with `searchCities`.
 */

class CitiesDexie extends Dexie {
	cities!: Table<City>

	constructor() {
		super('citiesDb')
		this.version(1).stores({
			cities: '&id, name, countryCode, [name+countryCode]',
		})
	}
}

interface RealFuseIndex<T> extends Fuse.FuseIndex<T> {
	size(): number
}

const citiesDb = new CitiesDexie()
const citiesFuse: Fuse<City> = new Fuse(
	[],
	{
		includeScore: true,
		keys: ['name'],
		minMatchCharLength: 1,
	},
)

const methods = {
	async citiesLoaded(): Promise<boolean> {
		const nbCities = await citiesDb.cities.count()
		return nbCities !== 0
	},

	async fetchCities() {
		if (await this.citiesLoaded()) {
			return
		}

		const response = await fetch('/cities.json')
		await citiesDb.cities.bulkAdd(await response.json())
		console.log('City DB populated')
	},

	isCitiesIndexLoaded(): boolean {
		return (citiesFuse.getIndex() as RealFuseIndex<City>).size() !== 0
	},

	async createCitiesIndex() {
		if (this.isCitiesIndexLoaded()) {
			return
		}

		console.log('Creating city index with', await citiesDb.cities.toArray(), 'cities')
		citiesFuse.setCollection(await citiesDb.cities.toArray())
		console.log('City index created with', (citiesFuse.getIndex() as RealFuseIndex<City>).size(), 'cities')
	},

	searchCities(searchQuery: string): City[] {
		console.log('Searching city with query: ', searchQuery)
		const searchArray = searchQuery.toUpperCase().split(' ')
		return citiesFuse
			.search(searchQuery, { limit: 20 })
			.sort((a, b) => {
				// Favorite exact country code match
				if (a.item.countryCode !== b.item.countryCode) {
					if (searchArray.includes(a.item.countryCode)) {
						return -1
					} else if (searchArray.includes(b.item.countryCode)) {
						return 1
					}
				}

				// Favorite higher population count
				if (a.score === b.score) {
					return b.item.population - a.item.population
				}

				return (a.score || 0) - (b.score || 0)
			})
			.map(result => result.item)
	},
}

onmessage = async function handleMessage({ data: { key, method, params } }: { data: { key: string, method: keyof typeof methods, params: any } }) {
	const value = methods[method](params)

	if (value instanceof Promise) {
		this.postMessage({ key, value: await value })
	} else {
		this.postMessage({ key, value })
	}
}
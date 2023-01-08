import Dexie, { type Table } from 'dexie'
import Fuse from 'fuse.js'

/**
 * The city list is a 16Mb file with 140777 entries. So it is an heavy task to fetch them and search them.
 * This file helps with manipulating cities.
 * You can fetch the cities with `fetchCities`.
 * This will also store them in indexedDB storage with Dexie (https://dexie.org) to avoid fetching them again in the futur.
 * You can create an index of the cities with `createCitiesIndex` that will use Fuse.js (https://fusejs.io).
 * You can then search cities with `searchCities`.
 */

export type City = {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	countryCode: string;
	population: number;
}

class CitiesDexie extends Dexie {
	cities!: Table<City>

	constructor() {
		super('citiesDb')
		this.version(1).stores({
			cities: '&id, name, countryCode, [name+countryCode]',
		})
	}
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

export async function citiesLoaded(): Promise<boolean> {
	const nbCities = await citiesDb.cities.count()
	return nbCities !== 0
}

export async function fetchCities() {
	if (await citiesLoaded()) {
		return
	}

	const response = await fetch('/cities.json')
	await citiesDb.cities.bulkAdd(await response.json())
	console.log('Cities DB populated')
}

export async function createCitiesIndex() {
	citiesFuse.setCollection(await citiesDb.cities.toArray())
	console.log('Index created')
}

export function searchCities(searchQuery: string): City[] {
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
}

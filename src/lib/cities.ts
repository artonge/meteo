export type City = {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	countryCode: string;
	population: number;
}

let cities: City[] = []

export async function fetchCities() {
	if (cities.length !== 0) {
		return
	}

	const response = await fetch('/cities.json')
	cities = await response.json()
}

export async function getCityList(): Promise<string[]> {
	await fetchCities()
	return cities.map(city => `${city.name} (${city.countryCode})`)
}

export function findCity(cityString: string): City | undefined {
	return cities.find(city => `${city.name} (${city.countryCode})` === cityString)
}

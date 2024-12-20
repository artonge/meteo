import { storeToRefs } from 'pinia'
import { getHours } from 'date-fns'

import { weatherIconNameMapDay, weatherIconNameMapNight, type Forecast, type WeatherCode } from './models'
import { useWeatherModelsStore } from "@/stores/weatherModels"
import type { City } from '../models'

const forecastEndpoint = 'https://api.open-meteo.com/v1/forecast'
const locationSearchEndpoint = 'https://geocoding-api.open-meteo.com/v1/search'

const hourlyParams = [
	'weather_code',
	'temperature_2m',
	'relativehumidity_2m',
	'apparent_temperature',
	'precipitation',
	'rain',
	'showers',
	'snowfall',
	'precipitation_probability',
	'cloudcover',
	'cloudcover_low',
	'cloudcover_mid',
	'cloudcover_high',
	'visibility',
	'windspeed_10m',
	'winddirection_10m',
	'pressure_msl',
]

const dailyParams = [
	'sunrise',
	'sunset',
]

export function getWeatherIconName(weatherCode: WeatherCode, time: Date): string {
	const iconName = weatherIconNameMapDay[weatherCode] || 'undefined'

	const hour = getHours(time)
	if (hour < 6 || hour >= 20) {
		return weatherIconNameMapNight[weatherCode] || iconName
	} else {
		return iconName
	}
}

export async function fetchForecast(latitude: number, longitude: number): Promise<Forecast> {
	const store = useWeatherModelsStore()
	const { enabled: enabledModelsKeys } = storeToRefs(store)

	const forecastRequest = new URL(forecastEndpoint)
	forecastRequest.searchParams.append('latitude', latitude.toString())
	forecastRequest.searchParams.append('longitude', longitude.toString())
	forecastRequest.searchParams.append('forecast_days', '10')
	forecastRequest.searchParams.append('hourly', hourlyParams.join(','))
	forecastRequest.searchParams.append('models', enabledModelsKeys.value.join(','))
	forecastRequest.searchParams.append('daily', dailyParams.join(','))
	forecastRequest.searchParams.append('current_weather', true.toString())
	forecastRequest.searchParams.append('timezone', 'auto')

	const result = await fetch(forecastRequest)
	const forecast = await result.json()

	function getValue(key: string, index: number, repetition: string = 'hourly') {
		if (forecast[repetition][key] !== undefined && forecast[repetition][key][index] !== null) {
			return forecast[repetition][key][index]
		} else {
			for (const model of enabledModelsKeys.value) {
				const modelKey = `${key}_${model}`
				if (forecast[repetition][modelKey] !== undefined && forecast[repetition][modelKey][index] !== null) {
					return forecast[repetition][modelKey][index]
				}
			}
		}
	}

	function getUnit(key: string) {
		if (forecast.hourly_units[key] !== undefined) {
			return forecast.hourly_units[key]
		} else {
			for (const model of enabledModelsKeys.value) {
				const modelKey = `${key}_${model}`
				if (forecast.hourly_units[modelKey] !== undefined) {
					return forecast.hourly_units[modelKey]
				}
			}
		}
	}

	return {
		hourly: forecast.hourly.time.map((timestamp: number, index: number) => {
			return {
				time: new Date(timestamp),
				weatherCode: getValue('weather_code', index),
				temperature: getValue('temperature_2m', index),
				relativeHumidity: getValue('relativehumidity_2m', index),
				apparentTemperature: getValue('apparent_temperature', index),
				precipitation: getValue('precipitation', index),
				rain: getValue('rain', index),
				showers: getValue('showers', index),
				snowfall: getValue('snowfall', index),
				precipitationProbability: getValue('precipitation_probability', index),
				cloudCover: getValue('cloudcover', index),
				cloudCoverLow: getValue('cloudcover_low', index),
				cloudCoverMid: getValue('cloudcover_mid', index),
				cloudCoverHigh: getValue('cloudcover_high', index),
				windSpeed: getValue('windspeed_10m', index),
				windDirection: getValue('winddirection_10m', index),
				pressureMSL: getValue('pressure_msl', index),
			}
		}),
		daily: forecast.daily.time.map((timestamp: number, index: number) => {
			return {
				time: new Date(timestamp),
				sunrise: getValue('sunrise', index, 'daily'),
				sunset: getValue('sunset', index, 'daily'),
			}
		}),
		units: {
			weatherCode: getUnit('weather_code'),
			temperature: getUnit('temperature_2m'),
			relativeHumidity: getUnit('relativehumidity_2m'),
			apparentTemperature: getUnit('apparent_temperature'),
			precipitation: getUnit('precipitation'),
			rain: getUnit('rain'),
			showers: getUnit('showers'),
			snowfall: getUnit('snowfall'),
			precipitationProbability: getUnit('precipitation_probability'),
			cloudCover: getUnit('cloudcover'),
			cloudCoverLow: getUnit('cloudcover_low'),
			cloudCoverMid: getUnit('cloudcover_mid'),
			cloudCoverHigh: getUnit('cloudcover_high'),
			windSpeed: getUnit('windspeed_10m'),
			windDirection: getUnit('winddirection_10m'),
			pressureMSL: getUnit('pressure_msl'),
		}
	}
}

export async function searchLocation(query: string): Promise<City[]> {
	const searchRequest = new URL(locationSearchEndpoint)
	searchRequest.searchParams.append('name', query)
	searchRequest.searchParams.append('count', '10')

	const response = await fetch(searchRequest)
	const { results } = await response.json()

	return results.map((city: any) => {
		return {
			id: Number.parseInt(city.id),
			name: city.name,
			latitude: city.latitude,
			longitude: city.longitude,
			countryCode: city.country_code,
			population: city.population,
		}
	})
}
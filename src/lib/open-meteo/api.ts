import type { Forecast } from "."

export type { Forecast } from "./index"

const endpoint = 'https://api.open-meteo.com/v1/forecast'

const hourlyParams = [
	'temperature_2m',
	'relativehumidity_2m',
	'apparent_temperature',
	'precipitation',
	'cloudcover',
	'cloudcover_low',
	'cloudcover_mid',
	'cloudcover_high',
	'windspeed_10m',
	'winddirection_10m',
	'pressure_msl',
]

const dailyParams = [
	'sunrise',
	'sunset',
]

const models = [
	'meteofrance_arome_france_hd',
	'meteofrance_seamless',
	'metno_nordic',
	'best_match',
]


export async function fetchForecast(latitude: number, longitude: number): Promise<Forecast> {
	const url = new URL(endpoint)
	url.searchParams.append('latitude', latitude.toString())
	url.searchParams.append('longitude', longitude.toString())
	url.searchParams.append('hourly', hourlyParams.join(','))
	url.searchParams.append('models', models.join(','))
	url.searchParams.append('daily', dailyParams.join(','))
	url.searchParams.append('current_weather', true.toString())
	url.searchParams.append('timezone', 'auto')

	const result = await fetch(url)
	const forecast = await result.json()

	function getValue(key: string, index: number) {
		if (forecast.hourly[key] !== undefined && forecast.hourly[key][index] !== null) {
			return forecast.hourly[key][index]
		} else {
			for (const model of models) {
				const modelKey = `${key}_${model}`
				if (forecast.hourly[modelKey] !== undefined && forecast.hourly[modelKey][index] !== null) {
					return forecast.hourly[modelKey][index]
				}
			}
		}
	}

	function getUnit(key: string) {
		if (forecast.hourly_units[key] !== undefined) {
			return forecast.hourly_units[key]
		} else {
			for (const model of models) {
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
				temperature: getValue('temperature_2m', index),
				relativeHumidity: getValue('relativehumidity_2m', index),
				apparentTemperature: getValue('apparent_temperature', index),
				precipitation: getValue('precipitation', index),
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
				sunrise: forecast.daily.sunrise[index],
				sunset: forecast.daily.sunset[index],
			}
		}),
		units: {
			temperature: getUnit('temperature_2m'),
			relativeHumidity: getUnit('relativehumidity_2m'),
			apparentTemperature: getUnit('apparent_temperature'),
			precipitation: getUnit('precipitation'),
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
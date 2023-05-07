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
			temperature: forecast.hourly_units.temperature_2m,
			relativeHumidity: forecast.hourly_units.relativehumidity_2m,
			apparentTemperature: forecast.hourly_units.apparent_temperature,
			precipitation: forecast.hourly_units.precipitation,
			cloudCover: forecast.hourly_units.cloudcover,
			cloudCoverLow: forecast.hourly_units.cloudcover_low,
			cloudCoverMid: forecast.hourly_units.cloudcover_mid,
			cloudCoverHigh: forecast.hourly_units.cloudcover_high,
			windSpeed: forecast.hourly_units.windspeed_10m,
			windDirection: forecast.hourly_units.winddirection_10m,
			pressureMSL: forecast.hourly_units.pressure_msl,
		}
	}
}
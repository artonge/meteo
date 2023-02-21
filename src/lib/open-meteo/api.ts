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
	'best_match',
]

export async function fetchForecast(latitude: number, longitude: number): Promise<Forecast> {
	const result = await fetch(`${endpoint}?latitude=${latitude}&longitude=${longitude}&hourly=${hourlyParams.join(',')}&models=${models.join(',')}&daily=${dailyParams.join(',')}&current_weather=true&timezone=auto`)
	const forecast = await result.json()

	return {
		hourly: forecast.hourly.time.map((timestamp: number, index: number) => {
			return {
				time: new Date(timestamp),
				temperature: forecast.hourly.temperature_2m[index],
				relativeHumidity: forecast.hourly.relativehumidity_2m[index],
				apparentTemperature: forecast.hourly.apparent_temperature[index],
				precipitation: forecast.hourly.precipitation[index],
				cloudCover: forecast.hourly.cloudcover[index],
				cloudCoverLow: forecast.hourly.cloudcover_low[index],
				cloudCoverMid: forecast.hourly.cloudcover_mid[index],
				cloudCoverHigh: forecast.hourly.cloudcover_high[index],
				windSpeed: forecast.hourly.windspeed_10m[index],
				windDirection: forecast.hourly.winddirection_10m[index],
				pressureMSL: forecast.hourly.pressure_msl[index],
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
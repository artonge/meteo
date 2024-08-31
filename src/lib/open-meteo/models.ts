export const weatherIconNameMapDay = {
	0: 'clear-day',
	1: 'mostly-clear-day',
	2: 'partly-cloudy-day',
	3: 'mostly-cloudy-day',
	45: 'fog',
	48: '',
	51: 'drizzle',
	52: '',
	53: '',
	56: 'freezingdrizzle',
	57: '',
	61: 'rain',
	63: '',
	65: '',
	66: 'freezingrain',
	67: '',
	71: 'snow',
	73: '',
	75: '',
	77: '',
	80: '',
	81: '',
	82: '',
	85: '',
	86: '',
	95: '',
	96: 'thunderstorm',
	99: '',
}

export type WeatherCode = keyof typeof weatherIconNameMapDay

export const weatherIconNameMapNight: Partial<Record<WeatherCode, string>> = {
	0: 'clear-night',
	1: 'mostly-clear-night',
	2: 'partly-cloudy-night',
	3: 'mostly-cloudy-night',
}

export interface CurrentWeather {
	time: Date
	temperature: number
	windSpeed: number
	windDirection: number
	weatherCode: number
}

export interface HourlyForecast {
	time: Date
	weatherCode: WeatherCode
	temperature: number
	relativeHumidity: number
	apparentTemperature: number
	precipitation: number
	cloudCover: number
	cloudCoverLow: number
	cloudCoverMid: number
	cloudCoverHigh: number
	windSpeed: number
	windDirection: number
	pressureMSL: number
}

export interface DailyForecast {
	time: Date
	sunrise: number
	sunset: number
}

export interface Units {
	weatherCode: 'wmo code'
	temperature: '°C'
	relativeHumidity: '%'
	apparentTemperature: '°C'
	precipitation: 'mm'
	cloudCover: '%'
	cloudCoverLow: '%'
	cloudCoverMid: '%'
	cloudCoverHigh: '%'
	windSpeed: 'km/h'
	windDirection: '°'
	pressureMSL: 'hPa'
}

export interface Forecast {
	hourly: HourlyForecast[]
	daily: DailyForecast[]
	units: Units
}
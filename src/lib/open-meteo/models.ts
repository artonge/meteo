export const weatherIconNameMapDay = {
	0: 'clearsky_day',
	1: 'fair_day',
	2: 'partlycloudy_day',
	3: 'cloudy',
	45: 'fog',
	48: 'fog', // Not accurate
	51: 'lightrain', // Not accurate
	52: 'lightrain', // Not accurate
	53: 'lightrain', // Not accurate
	56: 'lightsleet', // Not accurate
	57: 'lightsleet', // Not accurate
	61: 'lightrain',
	63: 'rain',
	65: 'heavyrain',
	66: 'sleet',
	67: 'heavysleet',
	71: 'lightsnow',
	73: 'snow',
	75: 'heavysnow',
	77: 'heavysleet', // Not accurate
	80: 'lightrainshowers_day',
	81: 'rainshowers_day',
	82: 'heavyrainshowers_day',
	85: 'lightsnowshowers_day',
	86: 'heavysnowshowers_day',
	95: 'rainandthunder',
	96: 'lightsleetandthunder',
	99: 'heavysleetandthunder',
}

export type WeatherCode = keyof typeof weatherIconNameMapDay

export const weatherIconNameMapNight: Partial<Record<WeatherCode, string>> = {
	0: 'clearsky_night',
	1: 'fair_night',
	2: 'partlycloudy_night',
	80: 'lightrainshowers_night',
	81: 'rainshowers_night',
	82: 'heavyrainshowers_night',
	85: 'lightsnowshowers_night',
	86: 'heavysnowshowers_night',
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
export interface CurrentWeather {
	time: Date
	temperature: number
	windSpeed: number
	windDirection: number
	weatherCode: number
}

export interface HourlyForecast {
	time: Date
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
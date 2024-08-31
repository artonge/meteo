import type { Plugin } from 'chart.js'

import type { WeatherIconsOptions } from './index.d'
import { getWeatherIconName } from '@/lib/open-meteo'

export const weatherIcons: Plugin = {
	id: 'weatherIcons',

	afterDraw(chart, args, options: WeatherIconsOptions) {
		const ctx = chart.ctx
		let lastPixelDraw = -1
		let lastIndexDraw = -1

		options.forecast.hourly.forEach(({ time, weatherCode }, i, a) => {
			// Don't draw the first icon.
			if (i === 0) {
				return
			}

			// Don't draw the same icon twice.
			if (lastIndexDraw > 0 && a[lastIndexDraw].weatherCode === weatherCode) {
				return
			}

			const pixel = chart.scales.x.getPixelForValue(time.getTime())

			// Prevent icon overlap.
			if (pixel < lastPixelDraw) {
				return
			}

			// Don't draw icons would be partially outside the chart.
			if (pixel > chart.scales.x.right - 30) {
				return
			}

			const iconName = getWeatherIconName(weatherCode, time)
			const svg = new Image()
			svg.src = `/public/weather-icons/${iconName}.svg`
			ctx.drawImage(svg, chart.scales.x.getPixelForValue(time.getTime()), 10, 30, 30)
			lastPixelDraw = pixel + 40
			lastIndexDraw = i
		})
	},

	defaults: {
		forecast: undefined,
	},
}
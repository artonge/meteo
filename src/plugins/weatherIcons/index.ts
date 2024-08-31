import type { Plugin } from 'chart.js'

import type { WeatherIconsOptions } from './index.d'
import { getWeatherIconName } from '@/lib/open-meteo'

export const weatherIcons: Plugin = {
	id: 'weatherIcons',

	afterDraw(chart, args, options: WeatherIconsOptions) {
		const ctx = chart.ctx
		const iconWidth = 30
		let lastPixelDraw = -1
		let lastDrawPositionIsUp = false

		options.forecast.hourly.forEach(({ time, weatherCode }, i, a) => {
			const pixel = chart.scales.x.getPixelForValue(time.getTime())

			// Prevent icon overlap.
			if (pixel - lastPixelDraw < iconWidth / 2) {
				return
			}

			// Don't draw icons would be partially outside the chart.
			if (pixel > chart.scales.x.right - iconWidth / 2) {
				return
			}

			const iconName = getWeatherIconName(weatherCode, time)
			const svg = new Image()
			svg.src = `/weather-icons/${iconName}.svg`
			ctx.drawImage(svg, chart.scales.x.getPixelForValue(time.getTime()) - iconWidth / 2, lastDrawPositionIsUp ? 10 : iconWidth + 2, iconWidth, iconWidth)
			lastPixelDraw = pixel
			lastDrawPositionIsUp = !lastDrawPositionIsUp
		})
	},

	defaults: {
		forecast: undefined,
	},
}
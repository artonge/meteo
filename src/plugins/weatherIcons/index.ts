import type { Plugin } from 'chart.js'

import type { WeatherIconsOptions } from './index.d'
import { getWeatherIconName } from '@/lib/open-meteo'

const iconImageCache = new Map<string, HTMLImageElement>()

export const weatherIcons: Plugin = {
	id: 'weatherIcons',

	afterDraw(chart, args, options: WeatherIconsOptions) {
		const ctx = chart.ctx
		const iconWidth = 30
		const firstPixel = chart.scales.x.getPixelForValue(options.forecast.hourly[0].time.getTime())
		let lastPixelDraw: number | undefined = undefined

		options.forecast.hourly.filter(({ time }) => {
			const timestamp = time.getTime()
			const pixel = chart.scales.x.getPixelForValue(timestamp)

			// Prevent first icon to be partially drawn outside of the canvas.
			if (pixel < firstPixel + iconWidth / 2) {
				return false
			}

			// Prevent icon overlap.
			if (lastPixelDraw !== undefined && Math.abs(pixel - lastPixelDraw) < iconWidth / 2) {
				return false
			}

			lastPixelDraw = pixel
			return true
		}).forEach(({ time, weatherCode }, i) => {
			const timestamp = time.getTime()
			const pixel = chart.scales.x.getPixelForValue(timestamp)

			// Don't draw icons that are outside of the canvas.
			if (pixel < chart.scales.x.left - iconWidth || pixel > chart.scales.x.right + iconWidth) {
				return
			}

			const iconName = getWeatherIconName(weatherCode, time)

			let svg: HTMLImageElement
			if (!iconImageCache.has(iconName)) {
				svg = new Image()
				// Source: https://github.com/metno/weathericons/tree/main
				svg.src = `/weather-icons/${iconName}.svg`
				iconImageCache.set(iconName, svg)
			} else {
				svg = iconImageCache.get(iconName) as HTMLImageElement
			}

			try {
				ctx.drawImage(svg, pixel - iconWidth / 2, i % 2 ? 10 : iconWidth + 2, iconWidth, iconWidth)
			} catch (error) {
				console.error('Failed to draw weather icon:', { error, svg, weatherCode })
			}
		})
	},

	defaults: {
		forecast: undefined,
	},
}
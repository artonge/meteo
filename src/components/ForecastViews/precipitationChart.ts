import type { Forecast } from "@/lib/open-meteo";
import type { ChartDatasetCustomTypesPerDataset, ChartOptions } from "chart.js";

enum PrecipitationColor {
	rain = '0, 145, 205',
	snowfall = '149, 214, 233',
}

export function getPrecipitationChart(forecast: Forecast): ChartDatasetCustomTypesPerDataset {

	const isSnow = forecast.hourly.map(({ rain, snowfall }) => snowfall > rain)

	return {
		type: 'bar',
		label: `Precipitations over the last hour`,
		data: forecast.hourly.map(({ precipitation }) => precipitation),
		barThickness: 'flex',
		// Some tweaks to make precipitation bars more explicit.
		// 1. shrink distribution from 0.1 to 1 (x/(100/0.8) + 0.2). This make low probability precipitation more visible.
		// 2. +0.1 when x > 50 (x > 50 ? 0.1 : 0). This make high probability precipitation even more visible.
		backgroundColor: forecast.hourly.map(({ precipitationProbability }, i) => `rgba(${PrecipitationColor[isSnow[i] ? 'snowfall' : 'rain']}, ${precipitationProbability / (100 / 0.8) + 0.2 + (precipitationProbability > 50 ? 0.1 : 0)})`),
		yAxisID: 'yp',
		datalabels: {
			display: false,
		},
	}
}

export function getPrecipitationScale(): ChartOptions<'line'>['scales'] {
	return {
		yp: {
			display: false,
			position: 'right',
			max: 8,
			beginAtZero: true,
		},
	}
}
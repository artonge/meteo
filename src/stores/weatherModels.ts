import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'


const models = {
	'best_match': "Best match",
	'ecmwf_ifs04': 'ECMWF IFS 0.4°',
	'ecmwf_ifs025': 'ECMWF IFS 0.25°',
	'ecmwf_aifs025': 'ECMWF AIFS 0.25°',
	'cma_grapes_global': 'CMA GRAPES Global',
	'bom_access_global': 'BOM ACCESS Global',
	'gfs_seamless': 'GFS Seamless',
	'gfs_global': 'GFS Global',
	'gfs_hrrr': 'GFS HRRR',
	'gfs_graphcast025': 'GFS GraphCast',
	'jma_seamless': 'JMA Seamless',
	'jma_msm': 'JMA MSM',
	'jma_gsm': 'JMA GSM',
	'icon_seamless': 'DWD ICON Seamless',
	'icon_global': 'DWD ICON Global',
	'icon_eu': 'DWD ICON EU',
	'icon_d2': 'DWD ICON D2',
	'gem_seamless': 'GEM Seamless',
	'gem_global': 'GEM Global',
	'gem_regional': 'GEM Regional',
	'gem_hrdps_continental': 'GEM HRDPS Continental',
	'meteofrance_seamless': 'Météo-France Seamless',
	'meteofrance_arpege_world': 'Météo-France ARPEGE World',
	'meteofrance_arpege_europe': 'Météo-France ARPEGE Europe',
	'meteofrance_arome_france': 'Météo-France AROME France',
	'meteofrance_arome_france_hd': 'Météo-France AROME France HD',
	'arpae_cosmo_seamless': 'ARPAE Seamless',
	'arpae_cosmo_2i': 'ARPAE COSMO 2I',
	'arpae_cosmo_2i_ruc': 'ARPAE COSMO 2I RUC',
	'arpae_cosmo_5m': 'ARPAE COSMO 5M',
	'metno_seamless': 'MET Norway Nordic Seamless (with ECMWF)',
	'metno_nordic': 'MET Norway Nordic',
	'knmi_seamless': 'KNMI Seamless (with ECMWF)',
	'knmi_harmonie_arome_europe': 'KNMI Harmonie Arome Europe',
	'knmi_harmonie_arome_netherlands': 'KNMI Harmonie Arome Netherlands',
	'dmi_seamless': 'DMI Seamless (with ECMWF)',
	'dmi_harmonie_arome_europe': 'DMI Harmonie Arome Europe',
	'ukmo_seamless': 'UK Met Office Seamless',
	'ukmo_global_deterministic_10km': 'UK Met Office Global 10km',
	'ukmo_uk_deterministic_2km': 'UK Met Office UK 2km',
}

type ModelKeys = keyof typeof models

export type ModelInfo = {
	key: ModelKeys
	label: string
	enabled: boolean
}

const defaultEnabledModels: ModelKeys[] = [
	'best_match',
]

export const useWeatherModelsStore = defineStore('weatherModels', {
	state: () => ({
		order: useLocalStorage('modelsOrder', Object.keys(models) as ModelKeys[]),
		enabled: useLocalStorage('enabledModels', defaultEnabledModels),
	}),
	getters: {
		models(): ModelInfo[] {
			return this.order
				.map(key => ({
					key,
					label: models[key],
					enabled: this.enabled.includes(key)
				}))
		},
		modelsKeys(): ModelKeys[] {
			return this.order
		},
	},
	actions: {
		setOrder(newOrder: ModelKeys[]) {
			this.order = newOrder
		},
		resetModels() {
			this.order = Object.keys(models) as ModelKeys[]
			this.enabled = defaultEnabledModels
		},
		toggleModel(modelKey: ModelKeys) {
			if (this.enabled.includes(modelKey)) {
				this.enabled = this.enabled.filter(key => key !== modelKey)
			} else {
				this.enabled = [...this.enabled, modelKey]
			}
		},
	}
})
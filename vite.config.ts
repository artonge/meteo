import { fileURLToPath, URL } from 'node:url'
import analyze from "rollup-plugin-analyzer";
import { VitePWA } from 'vite-plugin-pwa'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		VitePWA({
			registerType: 'autoUpdate',
			devOptions: {
				enabled: true
			},
			manifest: {
				name: 'meteo',
				short_name: 'meteo',
				description: 'Get weather forecasts for any place in the world!',
				theme_color: '#ffcc00',
				background_color: "#22378b",
				display: "standalone",
				icons: [
					{
						"src": "/android-chrome-192x192.png",
						"sizes": "192x192",
						"type": "image/png"
					},
					{
						"src": "/android-chrome-256x256.png",
						"sizes": "256x256",
						"type": "image/png"
					}
				],
			},
		})
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	build: {
		sourcemap: true,
		rollupOptions: {
			// plugins: [analyze()]
		},
	},
})

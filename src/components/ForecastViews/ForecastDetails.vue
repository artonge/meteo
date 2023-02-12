<script setup lang="ts">
import { format } from 'date-fns'

const props = defineProps<{
	time: string,
}>()
</script>
<template>
	<div class="forecast__details">
		<div>
			<div class="forecast__details__title">
				{{ format(new Date(props.time), 'ccc d') }}
			</div>
			<div class="forecast__details__subtitle">
				{{ format(new Date(props.time), 'p') }}
			</div>
		</div>
		<div class="forecast__details__slots">
			<div class="forecast_details_data">
				<slot name="detail_1"></slot>
			</div>
			<div class="forecast_details_data">
				<slot name="detail_2"></slot>
			</div>
		</div>
	</div>
</template>
<style lang="scss" scoped>
.forecast__details {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 8px 12px;

	@media only screen and (max-width: 800px) {
		padding: 4px 8px;
	}

	&__title {
		font-size: 24px;

		@media only screen and (max-width: 800px) {
			font-size: 20px;
		}
	}

	&__subtitle {
		font-size: 20px;

		@media only screen and (max-width: 800px) {
			font-size: 16px;
		}
	}

	&__slots {
		:deep(div) {

			display: flex;

			& span:first-child {
				text-align: right;
				width: 150px;
				margin-right: 8px;
			}
		}
	}
}
</style>

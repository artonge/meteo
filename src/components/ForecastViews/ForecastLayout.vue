<script setup lang="ts">
import ForecastDetails from './ForecastDetails.vue';

const props = defineProps<{
	time: string,
}>()
</script>
<template>
	<div class="forecast">
		<ForecastDetails :time="props.time">
			<template #detail_1>
				<slot name="detail_1"></slot>
			</template>
			<template #detail_2>
				<slot name="detail_2"></slot>
			</template>
		</ForecastDetails>
		<slot name="details"></slot>
		<div class="forecast__chart">
			<slot name="canvas"></slot>
		</div>
	</div>
</template>
<style lang="scss" scoped>
.forecast {
	height: 100%;
	display: flex;
	flex-direction: column;

	&__chart {
		flex-grow: 1;
		min-height: 0;
	}
}
</style>
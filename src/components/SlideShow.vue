<script setup lang="ts">
import { ref, reactive, computed, useSlots } from 'vue'

import type { EventTypes, Handler } from '@vueuse/gesture'
import { useSpring } from '@vueuse/motion'

const slots = useSlots()
const container = ref<HTMLDivElement>()
const currentIndex = ref(0)
const containerWidth = computed(
	() => container.value?.getBoundingClientRect().width || 0,
)
const springsValues = reactive(
	[0, 1, 2, 3].map((i) => ({ left: `${i * containerWidth.value}px`, scale: 1 })),
)
const springs = springsValues.map((value) => useSpring(value))

const dragHandler: Handler<'drag', EventTypes['drag']> = (info) => {
	const {
		dragging,
		movement: [mx],
		direction: [xDir],
		cancel,
	} = info
	console.log(info)

	if (dragging && Math.abs(mx) > (containerWidth.value * 2) / 3) {
		// currentIndex.value = Math.min(Math.max(currentIndex.value + (xDir > 0 ? -1 : 1), 0), springsValues.length)
		// console.log(`Reached swipe limit, switched to ${currentIndex.value}`)
		// cancel()
	} else if (!dragging && Math.abs(mx) > containerWidth.value / 2) {
		currentIndex.value = Math.min(
			Math.max(currentIndex.value + (mx > 0 ? -1 : 1), 0),
			springsValues.length,
		)
		console.log(`Animation stopped, switched to ${currentIndex.value}`, mx, xDir)
		cancel()
	}

	springs.forEach((spring, i) => {
		let x = (i - currentIndex.value) * containerWidth.value + (dragging ? mx : 0)
		x = Math.max(x, containerWidth.value * (-3 + i))
		x = Math.min(x, containerWidth.value * i)

		if (dragging) {
			console.log(`Follow to ${x}`)
			springsValues[i].left = `${x}px`
			springsValues[i].scale = dragging ? 1 - Math.abs(mx) / containerWidth.value / 2 : 1
		} else {
			console.log(`Animate to ${x}`)
			spring.set({
				left: `${x}px`,
				scale: dragging ? 1 - Math.abs(mx) / containerWidth.value / 2 : 1,
			})
		}
	})
}
</script>
<template>
	<div v-drag="dragHandler" class="slideshow-container" ref="container">
		<div v-for="slot in $slots" class="slideshow-item" style="{background: red;}">
			{{slot}}
		</div>
	</div>
</template>
<style scoped lang="scss">
.slideshow-container {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;

	& > :deep(*) {
		position: absolute;
		width: 100%;
		height: 100%;
		// touch-action: none;
		// box-shadow: 0 62.5px 125px -25px rgba(50, 50, 73, 0.5), 0 37.5px 75px -37.5px rgba(0, 0, 0, 0.6);
	}
}
</style>

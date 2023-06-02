<template>
	<header>
		<img :alt="$t('Logo of meteo')" src="@/assets/logo.svg" />

		<div class="header__content">
			<slot></slot>
		</div>
	</header>
</template>

<style scoped lang="scss">
header {
	width: 100%;
	height: 80px;
	padding: 12px;
	display: flex;
	align-items: center;
	background-color: var(--color-background-secondary);
	box-sizing: border-box;

	@media only screen and (max-width: 800px) {
		padding: 4px;
	}

	img {
		width: 150px;
		height: 100%;
		margin-right: 12px;

		@media only screen and (max-width: 800px) {
			width: 30px;
			height: 30px;
			object-fit: cover;
			object-position: left;
			margin-right: 0;
			margin-left: 8px;
		}
	}

	.header__content {
		margin-left: 12px;
		flex-grow: 1;

		@media only screen and (max-width: 800px) {
			margin-left: 8px;
		}
	}
}
</style>

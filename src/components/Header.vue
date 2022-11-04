<template>
  <header>
    <img
      alt="meteo logo"
      src="@/assets/logo.svg"
    />

    meteo

	<div class="header__content">
		<slot></slot>
	</div>
  </header>
</template>

<style scoped lang="scss">
header {
  width: 100%;
  height: 60px;
  padding: 12px;
  display: flex;
  align-items: center;

  img {
    height: 100%;
    margin-right: 12px;
  }

  .header__content {
    margin-left: 12px;
	flex-grow: 1;
  }
}
</style>

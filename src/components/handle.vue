<template>
	<div :class="cssClass" :style="style"></div>
</template>

<script>
export default {
	props: ['location','selectable','selected'],
	computed: {
		style: function() {
			var viewportPoint = this.$app.userToViewport(this.location);
			return {
				left: viewportPoint.x + 'px',
				top: viewportPoint.y + 'px'
			};
		},
		cssClass: function() {
			return {
				'point-marker': true,
				selected: this.selected,
			};
		}
	}
}
</script>

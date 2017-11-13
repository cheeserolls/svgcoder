<template>
	<div :class="cssClass" :style="style" :data-addr="addr"></div>
</template>

<script>
import _ from 'lodash';
import wrappers from '../util/wrappers.js';
export default {
	props: ['addr'],
	computed: {
		point: function() {
			return wrappers.point(this.addr);
		},
		style: function() {
			var viewportPoint = this.$app.userToViewport(this.point);
			return {
				left: viewportPoint.x + 'px',
				top: viewportPoint.y + 'px'
			};
		},
		selected: function() {
			return _.includes(this.$store.state.editor.selectedPoints, this.addr);
		},
		cssClass: function() {
			return {
				'point-marker': true,
				selected: this.selected,
				guide: this.point.guide
			};
		}
	}
}
</script>

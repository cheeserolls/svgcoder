<template>
	<rect :class="cssClass" :data-addr="addr" :x="x" :y="y" width="8" height="8" />
</template>

<script>
import _ from 'lodash';
import wrappers from '../util/wrappers.js';
export default {
	props: ['addr','guide'],
	computed: {
		point: function() {
			return wrappers.point(this.addr);
		},
		viewportPoint: function() {
			return this.$app.userToViewport(this.point);
		},
		x: function() {
			return this.viewportPoint.x - 4;
		},
		y: function() {
			return this.viewportPoint.y - 4;
		},
		selected: function() {
			return _.includes(this.$store.state.editor.selectedPoints, this.addr);
		},
		cssClass: function() {
			return {
				'point-marker': true,
				selected: this.selected,
				guide: this.guide
			};
		}
	}
}
</script>

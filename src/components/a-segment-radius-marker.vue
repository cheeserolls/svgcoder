<template>
	<rect :class="cssClass" data-addr="addr" :x="x" :y="y" width="8" height="8" />
</template>

<script>
import _ from 'lodash';
import markerMixin from './marker-mixin.js';
import wrappers from '../util/wrappers.js';
export default {
	mixins: [markerMixin],
	props: ['segmentAddr','vertex'],
	computed: {
		point: function() {
			var arc = wrappers.segment(this.segmentAddr);
			arc.setArcData();
			return arc.radiusHandle;
		},
		cssClass: function() {
			return {
				'marker': true,
				selected: this.selected
			};
		}
	},
	methods: {
		moveTo: function(x,y) {
		}/*,
		moveStart: function(e) {
			if ( this.filter(e) ) {
				var arc = wrappers.segment(this.segmentAddr);
				this.startRadiusX = arc.data.radiusX;
				this.startRadiusY = arc.data.radiusY;
			}
		},
		moveUpdate: function(e) {
			if ( this.filter(e) ) {
				var arc = wrappers.segment(this.segmentAddr);
				arc.setArcData();
				var dEl = arc.reverseRotate({x: e.dx, y: e.dy});
				this.$store.commit('updateSegmentData',{addr: this.segmentAddr, name: 'radiusX', value: this.startRadiusX + dEl.x});
				this.$store.commit('updateSegmentData',{addr: this.segmentAddr, name: 'radiusY', value: this.startRadiusY + dEl.y});
			}
		}*/
	}
}
</script>

<template>
	<rect :class="cssClass" data-addr="addr" :x="x" :y="y" width="8" height="8" />
</template>

<script>
import _ from 'lodash';
import cache from '../drawing/cache.js';
import markerMixin from './marker-mixin.js';
export default {
	mixins: [markerMixin],
	props: ['segmentAddr','vertex'],
	computed: {
		arc: function() {
			return cache.get('segments', this.segmentAddr);
		},
		point: function() {
			return this.arc.radiusHandle;
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
				this.startRadiusX = this.arc.rx;
				this.startRadiusY = this.arc.ry;
			}
		},
		moveUpdate: function(e) {
			if ( this.filter(e) ) {
				var dEl = arc.reverseRotate({x: e.dx, y: e.dy});
				this.$store.commit('updateNodeData',{addr: this.segmentAddr, name: 'radiusX', value: this.startRadiusX + dEl.x});
				this.$store.commit('updateNodeData',{addr: this.segmentAddr, name: 'radiusY', value: this.startRadiusY + dEl.y});
			}
		}*/
	}
}
</script>

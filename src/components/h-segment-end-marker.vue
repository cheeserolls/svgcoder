<template>
	<rect :class="cssClass" data-addr="addr" :x="x" :y="y" width="8" height="8" />
</template>

<script>
import _ from 'lodash';
import markerMixin from './marker-mixin.js';
import wrappers from '../util/wrappers.js';
export default {
	mixins: [markerMixin],
	props: ['segmentAddr'],
	computed: {
		point: function() {
			return wrappers.segment(this.segmentAddr).end;
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
			this.$store.commit('updateSegmentData',{addr: this.segmentAddr, name: 'endX', value: x});
		}
	}
}
</script>

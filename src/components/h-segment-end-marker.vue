<template>
	<rect :class="cssClass" data-addr="addr" :x="x" :y="y" width="8" height="8" />
</template>

<script>
import _ from 'lodash';
import markerMixin from './marker-mixin.js';
import cache from '../drawing/cache.js';
export default {
	mixins: [markerMixin],
	props: ['segmentAddr'],
	computed: {
		point: function() {
			return cache.get('segments',this.segmentAddr).end;
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
			this.$store.commit('updateNodeData',{addr: this.segmentAddr, name: 'endX', value: x});
		}
	}
}
</script>

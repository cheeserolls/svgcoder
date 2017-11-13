<template>
	<rect :class="cssClass" data-addr="addr" :x="x" :y="y" width="8" height="8" />
</template>

<script>
import _ from 'lodash';
import wrappers from '../util/wrappers.js';
export default {
	props: ['segmentAddr'],
	data: function() {
		return {
			addr: null
		};
	},
	computed: {
		point: function() {
			return wrappers.segment(this.segmentAddr).end;
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
			return _.includes(this.$store.state.editor.selectedMarkers, this.addr);
		},
		cssClass: function() {
			return {
				'marker': true,
				selected: this.selected
			};
		}
	},
	methods: {
		markerSelect: function(e) {
			if (e.target && (e.target !== this.$el)) {return;}
			if (e.range && (this.point.x < e.range.xMin || this.point.x > e.range.xMax || this.point.y < e.range.yMin || this.point.y > e.range.yMax)) {return;}
			switch (e.action) {
				case 'toggle':
					var action = ( this.selected ? 'remove' : 'add' );
					break;
				case 'deselect':
					var action = 'remove';
					break;
				case 'select':
					var action = 'add';
					break;
			}
			this.$store.commit('updateSelectedMarkers', {action: action, markers: [this.addr]});
		},
		moveTo: function(x,y) {
			this.$store.commit('updateSegmentData',{addr: this.segmentAddr, name: 'endX', value: x});
		}
	},
	created: function() {
		this.addr = this.$app.$editor.getAddr(this);
	},
	mounted: function() {
		this.$app.$on('markerSelect',this.markerSelect);
	},
	destroyed: function() {
		this.$app.$off('markerSelect',this.markerSelect);
	}
}
</script>

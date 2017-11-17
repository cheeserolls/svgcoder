<template>
	<rect :class="cssClass" :data-addr="addr" :x="x" :y="y" width="8" height="8" />
</template>

<script>
import cache from '../drawing/cache.js';
import _ from 'lodash';
import markerMixin from './marker-mixin.js';
export default {
	mixins: [markerMixin],
	props: ['pointAddr','guide'],
	computed: {
		addr: function() {
			return this.pointAddr;
		},
		point: function() {
			return cache.get(this.addr, 'point');
		},
		selected: function() {
			return this.point.selected;
		},
		cssClass: function() {
			return {
				'marker': true,
				'point-marker': true,
				selected: this.selected,
				guide: this.guide
			};
		},
	},
	methods: {
		select: function(e) {
			if ( this.filter(e) ) {
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
				this.$store.commit('updateSelection', {action: action, points: [this.addr]});
			}
		},
		moveTo: function(x,y) {
			this.$store.commit('updatePoints', {updates: [{addr: this.addr, x:x, y:y}] });
		}
	}
}
</script>

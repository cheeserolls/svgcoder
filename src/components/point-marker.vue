<template>
	<rect :class="cssClass" :data-addr="addr" :x="x" :y="y" width="8" height="8" />
</template>

<script>
import _ from 'lodash';
import markerMixin from './marker-mixin.js';
import wrappers from '../util/wrappers.js';
export default {
	mixins: [markerMixin],
	props: ['pointAddr','guide'],
	computed: {
		point: function() {
			return this.$store.state.drawing.points[this.addr];
		},
		selected: function() {
			return _.includes(this.$store.state.editor.selectedPoints, this.addr);
		},
		cssClass: function() {
			return {
				'marker': true,
				'point-marker': true,
				selected: this.selected,
				guide: this.guide
			};
		},
		addr: function() {
			return this.pointAddr;
		}
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

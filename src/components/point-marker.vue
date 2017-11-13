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
				'marker': true,
				'point-marker': true,
				selected: this.selected,
				guide: this.guide
			};
		}
	},
	methods: {
		filter: function(e) {
			if (e.target && (e.target !== this.$el)) {
				return false;
			}
			if (e.range && (this.point.x < e.range.xMin || this.point.x > e.range.xMax || this.point.y < e.range.yMin || this.point.y > e.range.yMax)) {
				return false;
			}
			if (e.selected && !this.selected) {
				return false;
			}
			return true;
		},
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
				this.$store.commit('updateSelectedPoints', {action: action, points: [this.addr]});
			}
		},
		moveStart: function(e) {
			if ( this.filter(e) ) {
				this.startX = this.point.x;
				this.startY = this.point.y;
			}
		},
		moveUpdate: function(e) {
			if ( this.filter(e) ) {
				this.moveTo( this.startX + e.dx, this.startY + e.dy );
			}
		},
		moveEnd: function(e) {
			this.moveUpdate(e);
		},
		moveTo: function(x,y) {
			this.$store.commit('updatePoints', {updates: [{addr: this.addr, x:x, y:y}] });
		}
	},
	mounted: function() {
		this.$app.$on('markerSelect',this.select);
		this.$app.$on('markerMoveStart',this.moveStart);
		this.$app.$on('markerMoveUpdate',this.moveUpdate);
		this.$app.$on('markerMoveEnd',this.moveEnd);
	},
	destroyed: function() {
		this.$app.$off('markerSelect',this.select);
		this.$app.$off('markerMoveStart',this.moveStart);
		this.$app.$off('markerMoveUpdate',this.moveUpdate);
		this.$app.$off('markerMoveEnd',this.moveEnd);
	}
}
</script>

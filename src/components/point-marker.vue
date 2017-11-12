<template>
	<div :class="cssClass" :style="style" :data-addr="addr"></div>
</template>

<script>
import _ from 'lodash';
export default {
	props: ['addr'],
	computed: {
		point: function() {
			return this.$store.state.drawing.points[this.addr];
		},
		/*location: function() {
			if (this.point.psuedo == 'end') {
				var segment = this.$store.state.drawing.segments[this.point.parent];
				if (segment.type == 'h' || segment.type == 'H') {
					var subpath = this.$store.state.drawing.subpaths[segment.parent];
					var segmentIndex = subpath.segments.indexOf(this.point.parent);
					if (segmentIndex == 0) {
						var start = this.$store.state.drawing.points[subpath.start];
					} else {
						var prevSegment = this.$store.state.drawing.segments[segmentIndex - 1];
						var start = this.$store.state.drawing.points[prevSegment.end];
					}
					return {x: segment.endX, y:start.y};
				}
			}
			return this.point;
		},*/
		style: function() {
			//var viewportPoint = this.$app.userToViewport(this.location);
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

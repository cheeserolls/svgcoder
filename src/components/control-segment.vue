<template>
	<g class="control-segment" :data-addr="addr">
		<path v-if="layer == 'guides'" :class="traceCssClass" :data-addr="addr" :d="d" />
		<guide-line v-if="layer == 'guides'" v-for="gl in guideLines" :key="gl.key" :start="gl.start" :end="gl.end" />
		<point-marker v-if="layer == 'markers'" v-for="pointAddr in this.points" :key="pointAddr" :pointAddr="pointAddr" :guide="false" />
		<point-marker v-if="layer == 'markers'" v-for="pointAddr in this.guidePoints" :key="pointAddr" :pointAddr="pointAddr" :guide="true" />
		<template v-if="layer == 'markers'" v-for="marker in this.markers">
			<h-segment-end-marker v-if="marker.type == 'h-end'" :segmentAddr="addr" :key="marker.key" />
			<h-segment-end-marker v-if="marker.type == 'v-end'" :segmentAddr="addr" :key="marker.key" />
			<!--<a-segment-radius-marker v-if="marker.type == 'arc-rad'" :segmentAddr="addr" :key="marker.key" />-->
			<!--<a-segment-rotation-marker v-if="marker.type == 'arc-rot'" :segmentAddr="addr" :key="marker.key" />-->
		</template>
	</g>
</template>

<script>
import cache from '../drawing/cache.js';
import PointMarker from './point-marker.vue';
import GuideLine from './control-guide-line.vue';
import HSegmentEndMarker from './h-segment-end-marker.vue';
import VSegmentEndMarker from './v-segment-end-marker.vue';
//import ASegmentRadiusMarker from './a-segment-radius-marker.vue';
//import ASegmentRotationMarker from './a-segment-rotation-marker.vue';
export default {
	props: ['addr','layer'],
	components: { GuideLine, PointMarker, HSegmentEndMarker, VSegmentEndMarker/*, ASegmentRadiusMarker, ASegmentRotationMarker*/ },
	computed: {
		segment: function() {
			return cache.get(this.addr, 'segment');
		},
		traceCssClass: function() {
			return {
				'segment-trace': true,
				'selected': this.segment.selected
			};
		},
		d: function() {
			// Create a path which is the same shape as this path segment, and in the same place, but in viewport coords
			var userValues = ['M', this.segment.start.x, this.segment.start.y];
			if (this.segment.typeLc == 'z') {
				userValues = userValues.concat(['L', this.segment.end.x, this.segment.end.y]);
			} else if (this.segment.typeLc == 's') {
				userValues = userValues.concat(['C', this.segment.s0.x, this.segment.s0.y, this.segment.c1.x, this.segment.c1.y, this.segment.end.x, this.segment.end.y]);
			} else if (this.segment.typeLc == 't') {
				userValues = userValues.concat(['Q', this.segment.s0.x, this.segment.s0.y, this.segment.end.x, this.segment.end.y]);
			} else {
				userValues = userValues.concat(this.segment.absoluteValues);
			}
			var viewportValues = this.$app.userPathToViewportPath(userValues);
			return viewportValues.join(' ');
		},
		points: function() {
			var points = [];
			if (this.segment.data.end) {points.push(this.segment.data.end);}
			return points;
		},
		guidePoints: function() {
			var points = [];
			if (this.segment.data.c0) {points.push(this.segment.data.c0);}
			if (this.segment.data.c1) {points.push(this.segment.data.c1);}
			return points;
		},
		guideLines: function() {
			var guideLines = [];
			if (this.segment.c0) {
				guideLines.push({
					key:'c0-guide/'+this.addr,
					start: {x: this.segment.start.x, y: this.segment.start.y},
					end: {x: this.segment.c0.x, y: this.segment.c0.y}
				});
			}
			if (this.segment.c1) {
				guideLines.push({
					key:'c0-guide/'+this.addr,
					start: {x: this.segment.end.x, y: this.segment.end.y},
					end: {x: this.segment.c1.x, y: this.segment.c1.y}
				});
			}
			return guideLines;
		},
		markers: function() {
			var markers = [];
			switch (this.segment.typeLc) {
				case 'h':
					markers.push({type: 'h-end', key:'h-end/'+this.addr });
					break;
				case 'v':
					markers.push({type: 'v-end', key:'v-end/'+this.addr });
					break;
			}
			return markers;
		}
	}
};
</script>

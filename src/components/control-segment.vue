<template>
	<g class="control-segment" :data-addr="addr">
		<guide-line v-for="gl in guideLines" :key="gl.key" :start="gl.start" :end="gl.end" />
		<point-marker v-for="pointAddr in this.points" :key="pointAddr" :pointAddr="pointAddr" :guide="false" />
		<point-marker v-for="pointAddr in this.guidePoints" :key="pointAddr" :pointAddr="pointAddr" :guide="true" />
		<template v-for="marker in this.markers">
			<h-segment-end-marker v-if="marker.type == 'h-end'" :segmentAddr="addr" :key="marker.key" />
			<h-segment-end-marker v-if="marker.type == 'v-end'" :segmentAddr="addr" :key="marker.key" />
		</template>
	</g>
</template>

<script>
import PointMarker from './point-marker.vue';
import GuideLine from './control-guide-line.vue';
import HSegmentEndMarker from './h-segment-end-marker.vue';
import VSegmentEndMarker from './v-segment-end-marker.vue';
import wrappers from '../util/wrappers.js';
export default {
	props: ['addr','pathSelected'],
	components: { GuideLine, PointMarker, HSegmentEndMarker, VSegmentEndMarker },
	computed: {
		points: function() {
			var segmentData = this.$store.state.drawing.segments[this.addr];
			var points = [];
			if (segmentData.end) {points.push(segmentData.end);}
			return points;
		},
		guidePoints: function() {
			var segmentData = this.$store.state.drawing.segments[this.addr];
			var guidePoints = [];
			if (segmentData.c0) {guidePoints.push(segmentData.c0);}
			if (segmentData.c1) {guidePoints.push(segmentData.c1);}
			return guidePoints;
		},
		guideLines: function() {
			var segment = wrappers.segment(this.addr);
			var guideLines = [];
			if (segment.c0) {
				guideLines.push({
					key:'c0-guide/'+this.addr,
					start: {x: segment.start.x, y: segment.start.y},
					end: {x: segment.c0.x, y: segment.c0.y}
				});
			}
			if (segment.c1) {
				guideLines.push({
					key:'c0-guide/'+this.addr,
					start: {x: segment.end.x, y: segment.end.y},
					end: {x: segment.c1.x, y: segment.c1.y}
				});
			}
			return guideLines;
		},
		markers: function() {
			var markers = [];
			var segmentData = this.$store.state.drawing.segments[this.addr];
			switch (segmentData.type.toLowerCase()) {
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

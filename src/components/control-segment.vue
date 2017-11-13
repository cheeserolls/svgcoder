<template>
	<g class="control-segment" :data-addr="addr">
		<point-marker v-for="point in this.points" :key="point.addr" :pointAddr="point.addr" :guide="point.guide" />
		<template v-for="marker in this.markers">
			<h-segment-end-marker v-if="marker.type == 'h-end'" :segmentAddr="addr" :key="marker.key" />
		</template>
	</g>
</template>

<script>
import PointMarker from './point-marker.vue';
import HSegmentEndMarker from './h-segment-end-marker.vue';
export default {
	props: ['addr','pathSelected'],
	components: { PointMarker, HSegmentEndMarker },
	computed: {
		points: function() {
			var segmentData = this.$store.state.drawing.segments[this.addr];
			var points = [];
			if (segmentData.c0) {points.push({addr: segmentData.c0, guide: true});}
			if (segmentData.c1) {points.push({addr: segmentData.c1, guide: true});}
			if (segmentData.end) {points.push({addr: segmentData.end, guide: false});}
			return points;
		},
		markers: function() {
			var markers = [];
			var segmentData = this.$store.state.drawing.segments[this.addr];
			switch (segmentData.type.toLowerCase()) {
				case 'h':
					markers.push({type: 'h-end', key:'h-end/'+this.addr });
					break;
			}
			return markers;
		}
	}
};
</script>

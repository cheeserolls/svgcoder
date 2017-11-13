<template>
	<g class="control-segment" :data-addr="addr">
		<point-marker v-for="point in this.points" :key="point.addr" :addr="point.addr" :guide="point.guide" />
	</g>
</template>

<script>
import PointMarker from './point-marker.vue';
export default {
	props: ['addr','pathSelected'],
	components: { PointMarker },
	computed: {
		points: function() {
			var segmentData = this.$store.state.drawing.segments[this.addr];
			var points = [];
			if (segmentData.c0) {points.push({addr: segmentData.c0, guide: true});}
			if (segmentData.c1) {points.push({addr: segmentData.c1, guide: true});}
			if (segmentData.end) {points.push({addr: segmentData.end, guide: false});}
			return points;
		}
	}
};
</script>

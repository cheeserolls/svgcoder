<template>
	<g class="control-subpath" :data-addr="addr">
		<point-marker :pointAddr="start" :guide="false" />
		<control-segment v-for="segmentAddr in segments" :key="segmentAddr" :addr="segmentAddr" :pathSelected="pathSelected" />
	</g>
</template>

<script>
import PointMarker from './point-marker.vue';
import ControlSegment from './control-segment.vue';
export default {
	props: ['addr','pathSelected'],
	components: { PointMarker, ControlSegment },
	computed: {
		start: function() {
			return this.$store.state.drawing.subpaths[this.addr].start;
		},
		segments: function() {
			return this.$store.state.drawing.subpaths[this.addr].segments;
		}
	}
};
</script>

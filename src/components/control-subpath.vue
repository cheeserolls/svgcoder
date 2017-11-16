<template>
	<g class="control-subpath" :data-addr="addr">
		<point-marker v-if="layer == 'markers'" :pointAddr="subpath.data.start" :guide="false" />
		<control-segment v-for="segmentAddr in subpath.data.segments" :key="segmentAddr" :addr="segmentAddr" :layer="layer" />
	</g>
</template>

<script>
import cache from '../drawing/cache.js';
import PointMarker from './point-marker.vue';
import ControlSegment from './control-segment.vue';
export default {
	props: ['addr','layer'],
	components: { PointMarker, ControlSegment },
	computed: {
		subpath: function() {
			return cache.get('subpaths', this.addr);
		}
	}
};
</script>

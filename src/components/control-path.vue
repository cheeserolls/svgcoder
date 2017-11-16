<template>
	<g class="control-path" :data-addr="addr">
		<control-subpath v-if="path.selected" v-for="subpathAddr in path.data.subpaths" :key="subpathAddr" :addr="subpathAddr" :layer="layer" />
	</g>
</template>

<script>
import cache from '../drawing/cache.js';
import ControlSubpath from './control-subpath.vue';
export default {
	props: ['addr','layer'],
	components: { ControlSubpath },
	computed: {
		path: function() {
			return cache.get('paths', this.addr);
		}
	}
};
</script>

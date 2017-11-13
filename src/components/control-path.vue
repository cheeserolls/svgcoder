<template>
	<g class="control-path" :data-addr="addr">
		<control-subpath v-if="selected" v-for="subpathAddr in subpaths" :key="subpathAddr" :addr="subpathAddr" />
	</g>
</template>

<script>
import _ from 'lodash';
import ControlSubpath from './control-subpath.vue';
export default {
	props: ['addr'],
	components: { ControlSubpath },
	computed: {
		subpaths: function() {
			return this.$store.state.drawing.nodes[this.addr].subpaths;
		},
		selected: function() {
			return _.includes(this.$store.state.editor.selectedPaths, this.addr);
		}
	}
};
</script>

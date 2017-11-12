<template>
	<component :is="ele.type+'_'" :addr="addr" :ele="ele" />
</template>

<script>
import SvgPath from './svg-path.vue';
export default {
	props: ['addr'],
	components: {
		path_: SvgPath
	},
	computed: {
		ele: function() {
			return this.$store.state.drawing.nodes[this.addr];
		}
	}
};
</script>

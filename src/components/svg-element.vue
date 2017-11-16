<template>
	<component v-if="componentName" :is="componentName" :addr="addr" :ele="ele" />
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
		},
		componentName: function() {
			switch (this.ele.nodeName) {
				case 'path':
					return 'path_';
			}
			return false;
		}
	}
};
</script>

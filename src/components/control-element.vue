<template>
	<component v-if="componentName" :is="componentName" :addr="addr" />
</template>

<script>
import ControlPath from './control-path.vue';
export default {
	props: ['addr'],
	components: {
		'control-path': ControlPath
	},
	computed: {
		componentName: function() {
			switch (this.$store.state.drawing.nodes[this.addr].type) {
				case 'path':
					return 'control-path';
			}
			return false;
		}
	}
};
</script>

<template>
	<svg class="control-root" version="1.1" xmlns="http://www.w3.org/2000/svg" :viewBox="viewboxStr" :data-addr="addr">
		<control-element v-for="addr in children" :key="addr" :addr="addr" />
	</svg>
</template>

<script>
import ControlElement from './control-element.vue';
export default {
	props: ['addr'],
	components: { ControlElement },
	computed: {
		viewboxStr: function() {
			return '0 0 '+this.$store.state.editor.viewport.width+' '+this.$store.state.editor.viewport.height;
		},
		children: function() {
			return this.$store.state.drawing.nodes[this.addr].children;
		}
	}
}
</script>

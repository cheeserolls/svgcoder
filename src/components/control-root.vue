<template>
	<svg class="control-root" version="1.1" xmlns="http://www.w3.org/2000/svg" :viewBox="viewboxStr" :data-addr="addr">
		<defs>
			<pattern id="selection-pattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
				<rect x="0" y="0" width="2" height="2" class="a" />
				<rect x="2" y="0" width="2" height="2" class="b" />
				<rect x="0" y="2" width="2" height="2" class="b" />
				<rect x="2" y="2" width="2" height="2" class="a" />
			</pattern>
			<pattern id="selected-pattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
				<rect x="0" y="0" width="2" height="2" class="a" />
				<rect x="2" y="0" width="2" height="2" class="b" />
				<rect x="0" y="2" width="2" height="2" class="b" />
				<rect x="2" y="2" width="2" height="2" class="a" />
			</pattern>
		</defs>
		<g id="guides-layer">
			<control-element v-for="addr in children" :key="addr" :addr="addr" layer="guides" />
		</g>
		<g id="markers-layer">
			<control-element v-for="addr in children" :key="addr" :addr="addr" layer="markers" />
		</g>
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

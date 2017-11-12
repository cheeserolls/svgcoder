<template>
	<svg version="1.1" xmlns="http://www.w3.org/2000/svg" :viewBox="viewboxStr" :data-addr="addr">
		<svg-element v-for="addr in children" :key="addr" :addr="addr" />
	</svg>
</template>

<script>
import SvgElement from './svg-element.vue';
export default {
	props: ['addr'],
	components: { SvgElement },
	computed: {
		viewboxStr: function() {
			var viewbox = this.$store.state.drawing.viewbox;
			return viewbox.x + ' ' + viewbox.y + ' ' + viewbox.width + ' ' + viewbox.height;
		},
		children: function() {
			var ele = this.$store.state.drawing.nodes[this.addr];
			return ele.children;
		}
	}
}
</script>

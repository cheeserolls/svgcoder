<template>
	<div class="current-tool">
		<component :is="currentTool"></component>
	</div>
</template>

<script>
export default {
	computed: {
		currentTool: function() {
			return this.$app.$tools[this.$store.state.editor.currentToolName];
		}
	}
}
</script>

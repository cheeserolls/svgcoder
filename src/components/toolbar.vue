<template>
	<div class="toolbar">
		<button v-for="tool in tools" :class="{ current: currentToolName === tool.name }" @click="selectTool(tool.name)" >
			{{ tool.label }}
			<span v-if="tool.hotkey">({{tool.hotkey}})</span>
		</button>
	</div>
</template>

<script>
export default {
	computed: {
		tools: function() {
			return this.$store.state.editor.tools;
		},
		currentToolName: function() {
			return this.$store.state.editor.currentToolName;
		}
	},
	methods: {
		selectTool: function(toolName) {
			this.$store.commit('selectTool', {toolName: toolName});
		}
	}
};
</script>

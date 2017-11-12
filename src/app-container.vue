<template>
	<div class="app-container">
		<editor class="editor" />
		<current-tool class="current-tool" />
		<toolbar class="toolbar" />
	</div>
</template>


<script>
import _ from 'lodash';
import Editor from './components/editor.vue';
import CurrentTool from './components/current-tool.vue';
import Toolbar from './components/toolbar.vue';
import SettingsTool from './tools/settings-tool.vue';
import ViewportTool from './tools/viewport-tool.vue';
import MoveTool from './tools/move-tool.vue';
import SelectTool from './tools/select-tool.vue';
import SvgLoader from './util/svg-loader.js';
export default {
	components: { Editor, CurrentTool, Toolbar },
	methods: {
		/* @todo - these transformations are wrong if the svg viewbox doesn't start at (0,0) */
		mouseEventToUser: function(e) {
			return this.pageToUser({x:e.pageX,y:e.pageY});
		},
		pageToUser: function(p) {
			return {
				x: (p.x - this.$store.state.editor.viewport.pageX - this.$store.state.editor.canvasOffset.x) / this.$store.state.editor.scale,
				y: (p.y - this.$store.state.editor.viewport.pageY - this.$store.state.editor.canvasOffset.y) / this.$store.state.editor.scale
			};
		},
		userToPage: function(p) {
			return {
				x: (p.x * this.$store.state.editor.scale) + this.$store.state.editor.viewport.pageX + this.$store.state.editor.canvasOffset.x,
				y: (p.y * this.$store.state.editor.scale) + this.$store.state.editor.viewport.pageY + this.$store.state.editor.canvasOffset.y
			};
		},
		userToViewport: function(p) {
			return {
				x: p.x * this.$store.state.editor.scale + this.$store.state.editor.canvasOffset.x,
				y: p.y * this.$store.state.editor.scale + this.$store.state.editor.canvasOffset.y
			};
		},
		addTool: function(name, label, component, opts) {
			this.$tools[name] = component;
			this.$store.commit('addTool', _.defaults({name: name, label: label}, opts));
		}
	},
	created: function() {
		this.$tools = {};
		this.addTool('settings','Settings',SettingsTool);
		this.addTool('viewport','Viewport',ViewportTool,{hotkey:'v'});
		this.addTool('select','Select',SelectTool,{hotkey:'s'});
		this.addTool('move','Move',MoveTool,{hotkey:'m'});
	},
	mounted: function() {
		var svgString = `
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
				<path d="M 10 20 L 50 30L 5 40Z " data-addr="a0" class="st0" style="stroke: black; stroke-width: 1;"></path>
				<path d="M 90 90 h -20 C 50 80 70 40 90 50" class="st0"></path>
			</svg>
		`;
		var loader = new SvgLoader();
		var data = loader.extractDataFromSvgString( svgString );
		this.$store.commit('replaceEntireDrawing', data);
	}
};
</script>

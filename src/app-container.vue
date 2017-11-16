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
import DrawTool from './tools/draw-tool.vue';
import Addresser from './util/addresser.js';
import SvgLoader from './util/svg-loader.js';
import wrappers from './util/wrappers.js';
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
		userPathToViewportPath: function(values) {
			var out = [];
			var i = 0;
			var copyVals = (n) => {
				while (n--) {
					out.push(values[i++]);
				}
			};
			var copyScaleVals = (n) => {
				while (n--) {
					out.push( values[i++] * this.$store.state.editor.scale );
				}
			};
			var copyTransformedPoints = (n) => {
				while (n--) {
					var x = values[i++];
					var y = values[i++];
					var p = this.userToViewport({x: x, y: y});
					out.push(p.x);
					out.push(p.y);
				}
			};
			var doGroup = () => {
				var type = values[i];
				copyVals(1);
				var typeLc = type.toLowerCase();
				var relative = (type == typeLc);
				switch (typeLc) {
					case 'm': case 'l': case 't':
						relative ? copyScaleVals(2) : copyTransformedPoints(1);
						return;
					case 'h':
						if ( relative ) {
							copyScaleVals(1);
						} else {
							var x = values[i++];
							var p = this.userToViewport({x: x, y: 0});
							out.push(p.x);
						}
						return;
					case 'v':
						if ( relative ) {
							copyScaleVals(1);
						} else {
							var x = values[i++];
							var p = this.userToViewport({x: 0, y: y});
							out.push(p.y);
						}
						return;
					case 'c':
						relative ? copyScaleVals(6) : copyTransformedPoints(3);
						return;
					case 's': case 'q':
						relative ? copyScaleVals(4) : copyTransformedPoints(2);
						return;
					case 'a':
						copyScaleVals(2);
						copyVals(3);
						relative ? copyScaleVals(2) : copyTransformedPoints(1);
						return;
					case 'z':
						return
				}
			};
			while (i < values.length) {doGroup();}
			return out;
		},
		addTool: function(name, label, component, opts) {
			this.$tools[name] = component;
			this.$store.commit('addTool', _.defaults({name: name, label: label}, opts));
		}
	},
	created: function() {
		wrappers.setState(this.$store.state.drawing);
		this.$tools = {};
		this.addTool('settings','Settings',SettingsTool);
		this.addTool('viewport','Viewport',ViewportTool,{hotkey:'v'});
		this.addTool('select','Select',SelectTool,{hotkey:'s'});
		this.addTool('move','Move',MoveTool,{hotkey:'m'});
		this.addTool('draw','Draw',DrawTool,{hotkey:'d'});
	},
	mounted: function() {
		this.$drawingAddresser = new Addresser();
		var svgString = `
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
				<path d="M 10 20 L 50 30L 5 40Z " data-addr="a0" class="st0" style="stroke: black; stroke-width: 1;"></path>
				<path d="M 90 90 h -20 C 50 80 70 40 90 50" class="st0"></path>
				<path d="M 10 90 A 15 30 20 1 1 40 80 L 50 95 Z" class="st0"></path>
			</svg>
		`;
		var loader = new SvgLoader(this.$drawingAddresser);
		var data = loader.extractDataFromSvgString( svgString );
		this.$store.commit('replaceEntireDrawing', data);
	}
};
</script>

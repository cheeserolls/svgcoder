<template>
	<div>
		<div class="viewport" @mousedown="mousedown" @mousemove="mousemove" @wheel="wheel">
			<div class="canvas" :style="canvasStyle">
				<svg-root :addr="rootNodeAddr" />
			</div>
			<div class="markers">
				<handle v-for="handle in handles" :key="handle.addr" :location="handle.location" :selectable="true" :selected="handle.selected"  />
			</div>
		</div>
	</div>
</template>

<script>
import _ from 'lodash';
import SvgRoot from './svg-root.vue';
import Handle from './handle.vue';
export default {
	components: {SvgRoot, Handle},
	computed: {
		canvasStyle: function() {
			var style = this.$store.getters.canvasRect;
			style.top += 'px';
			style.left += 'px';
			style.width += 'px';
			style.height += 'px';
			return style;
		},
		rootNodeAddr: function() {
			return this.$store.state.drawing.rootNode;
		},
		handles: function() {
			var markedPoints = [];
			for (var eleAddr of this.$store.state.editor.selectedPaths) {
				var ele = this.$store.state.drawing.nodes[eleAddr];
				for (var subpathAddr of ele.subpaths) {
					var subpath = this.$store.state.drawing.subpaths[subpathAddr];
					markedPoints.push(subpath.start);
					for (var segmentAddr of subpath.segments) {
						var segment = this.$store.state.drawing.segments[segmentAddr];
						if (segment.c0) {markedPoints.push(segment.c0);}
						if (segment.c1) {markedPoints.push(segment.c1);}
						if (segment.end) {markedPoints.push(segment.end);}
					}
				}
			}
			return markedPoints.map( pointAddr => {
				var point = this.$store.state.drawing.points[pointAddr];
				return {
					addr: pointAddr,
					location: point,
					selected: _.includes(this.$store.state.editor.selectedPoints, pointAddr)
				};
			} );
		}
	},
	mounted: function() {

		this.viewport = this.$el.getElementsByClassName('viewport')[0];
		this.canvas = this.viewport.getElementsByClassName('canvas')[0];

		this.resize();
		this.fitDrawingInViewport();

		window.addEventListener('resize', this.resize);
		window.addEventListener('load', this.resize);
		window.addEventListener('keydown', this.keydown);
		this.$app.$on('fitDrawingInViewport',this.fitDrawingInViewport);

	},
	destroyed: function() {

		window.removeEventListener('resize', this.resize);
		window.removeEventListener('load', this.resize);
		window.removeEventListener('keydown', this.keydown);
		this.$app.$off('fitDrawingInViewport',this.fitDrawingInViewport);

	},
	methods: {
		resize: function() {
			var box = this.viewport.getBoundingClientRect();
			this.$store.commit('updateViewport',{
				pageX: box.left + window.pageXOffset,
				pageY: box.top + window.pageYOffset,
				width: this.viewport.offsetWidth,
				height: this.viewport.offsetHeight
			});
		},
		fitDrawingInViewport: function() {

			var w1 = this.$store.state.drawing.viewbox.width;
			var h1 = this.$store.state.drawing.viewbox.height;
			var w2 = this.$store.state.editor.viewport.width;
			var h2 = this.$store.state.editor.viewport.height;

			var scale = Math.min( (h2 - 10) / h1, (w2 - 10) / w1 );

			this.$store.commit('reposition',{
				scale: scale,
				canvasOffsetX: 0.5 * (w2 - w1 * scale),
				canvasOffsetY: 0.5 * (h2 - h1 * scale)
			});

		},
		mousedown: function(e) {
			var self = this;
			var mouseStart = {x: e.pageX, y: e.pageY};
			var extendDragEvent = function(e) {
				e.start = mouseStart;
				e.dx = e.pageX - mouseStart.x;
				e.dy = e.pageY - mouseStart.y;
				return e;
			};
			console.log('editor mousedown');
			var checkDrag = function(e) {
				console.log('editor checkDrag');
				if ( Math.abs(e.pageX - mouseStart.x) > 4 || Math.abs(e.pageY - mouseStart.y) > 4 ) {
					window.removeEventListener('mousemove',checkDrag);
					window.addEventListener('mousemove',dragupdate);
					window.removeEventListener('mouseup',click);
					window.addEventListener('mouseup',dragend);
					console.log('editor dragstart');
					self.$app.$emit('editorDragstart',extendDragEvent(e));
				}
			};
			var click = function(e) {
				window.removeEventListener('mousemove',checkDrag);
				window.removeEventListener('mouseup',click);
				console.log('editor click');
				self.$app.$emit('editorClick',e);
			};
			var dragupdate = function(e) {
				console.log('editor dragupdate');
				self.$app.$emit('editorDragupdate',extendDragEvent(e));
			};
			var dragend = function(e) {
				window.removeEventListener('mousemove',dragupdate);
				window.removeEventListener('mouseup',dragend);
				console.log('editor dragend');
				self.$app.$emit('editorDragend',extendDragEvent(e));
			};
			window.addEventListener('mousemove',checkDrag);
			window.addEventListener('mouseup',click);
		},
		mousemove: function(e) {
			console.log('editor mousemove');
			this.$app.$emit('editorMousemove',e);
		},
		keydown: function(e) {
			if ( e.target === document.body ) {

				console.log('editor keydown '+e.key);
				this.$app.$emit('editorKeydown',e);

				for (var tool of this.$store.state.editor.tools) {
					if (tool.hotkey === e.key) {
						this.$store.commit('selectTool', {toolName: tool.name});
						break;
					}
				}

				switch(e.key) {
					case ' ':
						// spacebar to deselect
						this.$store.commit('deselect');
						break;
				}
			}
		},
		wheel: function(e) {
			console.log('wheel');
			this.$app.$emit('editorWheel',e);
		}
	}
}
</script>

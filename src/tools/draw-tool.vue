<template>
	<form>
		<h4>Draw Tool</h4>
		<p>Currently Drawing: {{ currentType }}</p>
		<p v-if="!path">Click on the canvas to start drawing a path.</p>
		<p v-if="path">Press enter to finish drawing the path.</p>
		<p v-if="path && currentSubpath">Press 'z' to close the current subpath.</p>
		<p v-if="path && !currentSubpath">Click on the canvas to start drawing a subpath.</p>
		<p v-if="options.length">
			Select the type of segment to draw:
			<template v-for="option in options" >
				<label>
					<input type="radio" name="typeLc" :value="option.typeLc" :checked="option.typeLc == currentTypeLc" @change="changeType(option.typeLc)" />
					({{option.typeLc}}) {{option.label}}
				</label>
				<br />
			</template>
		</p>
	</form>
</template>

<script>
import cache from '../drawing/cache.js';
import geom from '../drawing/geom.js';
export default {
	data: function() {
		return {
			pathAddr: null,
			relative: false,
			nextTypeLc: 'l',
			pointNameQueue: [],
		};
	},
	computed: {
		nextType: function() {
			return this.relative ? this.nextTypeLc : this.nextTypeLc.toUpperCase();
		},
		path: function() {
			return this.pathAddr ? cache.get('paths', this.pathAddr) : null;
		},
		currentSubpath: function() {
			var lastSubpath = this.path ? this.path.lastSubpath : null;
			var lastSegment = lastSubpath ? lastSubpath.lastSegment : null;
			var lastSubpathIsOpen = lastSegment ? (lastSegment.type.toLowerCase() != 'z') : true;
			return (lastSubpath && lastSubpathIsOpen) ? lastSubpath : null;
		},
		currentSegment: function() {
			return this.currentSubpath ? this.currentSubpath.lastSegment : null;
		},
		currentType: function() {
			return ( this.currentSegment ? this.currentSegment.type : ( this.relative ? 'm' : 'M' ) );
		},
		currentTypeLc: function() {
			return this.currentType.toLowerCase();
		},
		prevSegment: function() {
			return this.currentSegment ? this.currentSegment.prev : null;
		},
		prevType: function() {
			return this.prevSegment ? this.prevSegment.type : '';
		},
		prevTypeLc: function() {
			return this.prevType.toLowerCase();
		},
		options: function() {
			var options = [];
			if (this.currentSubpath) {
				options.push({typeLc: 'l', label: 'Line'});
				options.push({typeLc: 'h', label: 'Horizontal line'});
				options.push({typeLc: 'v', label: 'Vertical line'});
				options.push({typeLc: 'c', label: 'Cubic curve'});
				if (this.prevTypeLc == 'c') {
					options.push({typeLc: 's', label: 'Smooth cubic curve'});
				}
				options.push({typeLc: 'q', label: 'Quadratic curve'});
				if (this.prevTypeLc == 'q') {
					options.push({typeLc: 't', label: 'Smooth quadratic curve'});
				}
				options.push({typeLc: 'a', label: 'Arc'});
				options.push({typeLc: 'z', label: 'Close subpath'});
			}
			return options;
		},
	},
	methods: {
		pointNamesFor: function(typeLc) {
			switch (typeLc) {
				case 'l': case 'h': case 'v': case 't': case 'a':
					return ['end'];
				case 'c':
					return ['end','c0','c1'];
				case 'q':
					return ['end','c0'];
				case 's':
					return ['end','c1'];
			}
		},
		changeType: function(typeLc) {
			if (this.currentSegment) {
				this.currentSegment.changeType( this.relative ? typeLc : typeLc.toUpperCase() );
				this.pointNameQueue = this.pointNamesFor(typeLc);
				this.nextTypeLc = typeLc;
			}
		},
		newSubpath: function(x,y) {
			if (this.path) {
				var path = this.path;
				var pathAddr = this.pathAddr;
			} else {
				var pathData = {nodeName:'path', class: 'st0', subpaths:[]};
				var pathAddr = this.pathAddr = this.$app.$drawingAddresser.getAddr(pathData);
				this.$store.commit('addNode',{addr: pathAddr, data: pathData});
				var rootAddr = this.$store.state.drawing.rootNode;
				var existingChildren = this.$store.state.drawing.nodes[rootAddr].children;
				this.$store.commit('updateNodeData',{addr: rootAddr, name: 'children', value: _.concat(existingChildren, pathAddr)});
				var path = cache.get('paths', pathAddr);
			}
			var subpathAddr = path.addSubpath(this.relative, x, y);
			this.$store.commit('updateSelection',{action:'replace', paths:[pathAddr]});
			this.newSegment(subpathAddr, x, y);
		},
		newSegment: function(subpathAddr, endX, endY) {
			var subpath = cache.get('subpaths',subpathAddr);
			var segmentAddr = subpath.addSegment(this.nextType, endX, endY);
			this.$store.commit('updateSelection',{action:'replace', segments:[segmentAddr]});
			this.pointNameQueue = this.pointNamesFor(this.nextTypeLc);
		},
		closeSubpath: function(subpathAddr) {
			var subpath = cache.get('subpaths',subpathAddr);
			var segmentAddr = subpath.addSegment( this.relative ? 'z' : 'Z' );
			this.$store.commit('updateSelection',{action:'deselect', segments:true});
			this.pointNameQueue = [];
		},
		deleteCurrentSegment: function(cascadeSubpath, cascadePath) {
			if (this.currentSubpath && this.currentSegment) {
				var numSubpathsInPath = this.path.data.subpaths.length;
				var numSegmentsInSubpath = this.currentSubpath.segments.length;
				this.currentSubpath.deleteSegment( this.currentSegment.index );
				if (cascadeSubpath && numSegmentsInSubpath == 1) {
					// if there was only one segment in the subpath, then delete the (now empty) subpath too
					this.path.deleteSubpath( this.currentSubpath.index );
					// if there was only one subpath in the path, then delete the (now empty) path too
					if (cascadePath && numSubpathsInPath == 1) {
						this.path.parent.deleteChild( this.path.index );
						this.pathAddr = null;
					}
				}
			}
		},
		click: function(e) {
			var p = this.$app.mouseEventToUser(e);
			if (this.pointNameQueue.length) {
				this.mousemove(e);
				this.pointNameQueue.shift();
				if (!this.pointNameQueue.length) {
					this.newSegment(this.currentSubpath.addr, p.x, p.y);
				}
			} else {
				this.newSubpath(p.x, p.y);
			}
		},
		mousemove: function(e) {
			var p = this.$app.mouseEventToUser(e);
			if (this.currentSegment && this.pointNameQueue.length) {
				var start = this.currentSegment.start;
				var end = ( this.pointNameQueue[0] == 'end' ? p : this.currentSegment.end );
				var updates = [];
				for (var i=0; i<this.pointNameQueue.length; i++) {
					var pointName = this.pointNameQueue[i];
					var point = this.currentSegment[pointName];
					if (i > 0 && pointName == 'c0') {
						var pos = geom.interpolate(1/3, start, end);
						this.currentSegment.movePoint(pointName, pos.x, pos.y);
					} else if (i > 0 && pointName == 'c1') {
						var pos = geom.interpolate(2/3, start, end);
						this.currentSegment.movePoint(pointName, pos.x, pos.y);
					} else {
						// always put the current point right at the cursor
						this.currentSegment.movePoint(pointName, p.x, p.y);
					}
				}
			}
		},
		keydown: function(e) {
			switch (e.key) {
			 	case 'Enter':
					// indicates the drawing has finished - remove the current segment and end drawing
					this.deleteCurrentSegment(true, true);
					this.pathAddr = null;
					this.pointNameQueue = [];
					this.$store.commit('deselect');
					e.handled = true;
					return;
				case 'z':
					// remove the current segment, close the current subpath, and start a new subpath
					this.deleteCurrentSegment(true, false);
					this.closeSubpath(this.currentSubpath.addr);
					this.pointNameQueue = [];
					e.handled = true;
					return;
			}
			for (var option of this.options) {
				if (option.typeLc == e.key) {
					this.changeType( option.typeLc );
					e.handled = true;
				}
			}
		}
	},
	mounted: function() {
		this.$app.$on('editorClick', this.click);
		this.$app.$on('editorMousemove', this.mousemove);
		this.$app.$on('editorKeydown', this.keydown);
	},
	destroyed: function() {
		this.$app.$off('editorClick', this.click);
		this.$app.$off('editorMousemove', this.mousemove);
		this.$app.$off('editorKeydown', this.keydown);
	}
};

</script>

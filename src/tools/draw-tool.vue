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
import wrappers from '../util/wrappers.js';
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
			return this.pathAddr ? wrappers.path(this.pathAddr) : null;
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
		changeType: function(typeLc) {
			if (this.currentSegment) {
				var endX = this.currentSegment.end.x;
				var endY = this.currentSegment.end.y;
				this.deleteCurrentSegment(false, false);
				this.nextTypeLc = typeLc;
				this.newSegment(this.currentSubpath.addr, endX, endY);
			}
		},
		newSubpath: function(x,y) {
			console.log('newSubpath');
			var a = this.$app.$drawingAddresser;
			if (this.pathAddr) {
				var pathAddr = this.pathAddr;
			} else {
				var pathData = {type:'path', class: 'st0', subpaths:[]};
				var pathAddr = a.getAddr(pathData);
				this.$store.commit('addNode',{addr: pathAddr, data: pathData, parentAddr: null, position: 'end'});
				this.pathAddr = pathAddr;
			}
			var subpathData = {parent: pathAddr, relative: this.relative, segments:[]};
			var subpathAddr = a.getAddr(subpathData);
			var startData = {parent: pathAddr, x: x, y: y};
			var startAddr = a.getAddr(startData);
			subpathData.start = startAddr;
			this.$store.commit('addPoint',{addr: startAddr, data: startData});
			this.$store.commit('addSubpath',{addr: subpathAddr, data: subpathData, pathAddr: pathAddr, position: 'end'});
			this.$store.commit('deselect');
			this.$store.commit('updateSelection',{action:'replace', paths:[pathAddr]});
			this.newSegment(subpathAddr, x, y);
		},
		newSegment: function(subpathAddr, x, y) {
			console.log('newSegment');
			var a = this.$app.$drawingAddresser;
			var segmentData = {parent: subpathAddr, type: this.nextType};
			var segmentAddr = a.getAddr(segmentData);
			switch (this.nextTypeLc) {
				case 'l': case 't':
					var pointNames = ['end'];
					break;
				case 'c':
					var pointNames = ['end','c0','c1'];
					break;
				case 'q':
					var pointNames = ['end','c0'];
					break;
				case 's':
					var pointNames = ['end','c1'];
					break;
				case 'h':
					var pointNames = ['_end_'];
					segmentData.endX = x;
					break;
				case 'v':
					var pointNames = ['_end_'];
					segmentData.endY = y;
					break;
				case 'a':
					var pointNames = ['end'];
					segmentData.radiusX = 10;
					segmentData.radiusY = 20;
					segmentData.rot = 0;
					segmentData.arc = 0;
					segmentData.sweep = 0;
					break;
			}
			for (var pointName of pointNames) {
				if (pointName == '_end_') {continue;}
				var pointData = {parent: segmentAddr, x: x, y: y};
				var pointAddr = a.getAddr(pointData);
				segmentData[pointName] = pointAddr;
				this.$store.commit('addPoint',{addr: pointAddr, data: pointData});
			}
			this.$store.commit('addSegment',{addr: segmentAddr, data: segmentData, subpathAddr: subpathAddr, position: 'end'});
			this.$store.commit('updateSelection',{action:'replace', segments:[segmentAddr]});
			this.pointNameQueue = pointNames;
		},
		closeSubpath: function(subpathAddr) {
			console.log('closeSubpath');
			var a = this.$app.$drawingAddresser;
			var segmentData = {parent: subpathAddr, type: this.relative ? 'z' : 'Z'};
			var segmentAddr = a.getAddr(segmentData);
			this.$store.commit('addSegment',{addr: segmentAddr, data: segmentData, subpathAddr: subpathAddr, position: 'end'});
		},
		deleteCurrentSegment: function(cascadeSubpath, cascadePath) {
			if (! this.currentSegment) {return;}
			var numSubpathsInPath = this.path.data.subpaths.length;
			var numSegmentsInSubpath = this.currentSubpath.segments.length;
			for (var pointName of ['end','c0','c1']) {
				var point = this.currentSegment[pointName];
				if (point) {
					this.$store.commit('updateSelection',{action:'remove', points:[point.addr]});
					this.$store.commit('deletePoint',{addr: point.addr});
				}
			}
			this.$store.commit('updateSelection',{action:'remove', segments:[this.currentSegment.addr]});
			this.$store.commit('deleteSegment',{addr: this.currentSegment.addr});
			if (cascadeSubpath && numSegmentsInSubpath == 1) {
				// if there was only one segment in the subpath, then delete the (now empty) subpath too
				var subpathAddr = this.currentSubpath.addr;
				this.$store.commit('deleteSubpath',{addr: subpathAddr});
				// if there was only one subpath in the path, then delete the (now empty) path too
				if (cascadePath && numSubpathsInPath == 1) {
					this.$store.commit('updateSelection',{action:'remove', paths:[this.pathAddr]});
					this.$store.commit('deleteNode',{addr: this.pathAddr});
					this.pathAddr = null;
				}
			}
		},
		click: function(e) {
			console.log('click');
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
				if (this.currentTypeLc == 'h') {
					this.$store.commit('updateSegmentData',{addr: this.currentSegment.addr, name: 'endX', value: p.x});
				} else if (this.currentTypeLc == 'v') {
					this.$store.commit('updateSegmentData',{addr: this.currentSegment.addr, name: 'endY', value: p.y});
				} else {
					var start = this.currentSegment.start;
					var end = ( this.pointNameQueue[0] == 'end' ? p : this.currentSegment.end );
					var updates = [];
					for (var i=0; i<this.pointNameQueue.length; i++) {
						var pointName = this.pointNameQueue[i];
						var point = this.currentSegment[pointName];
						if (i > 0 && pointName == 'c0') {
							updates.push({addr: point.addr, x: start.x * 0.7 + end.x * 0.3, y: start.y * 0.7 + end.y * 0.3});
						} else if (i > 0 && pointName == 'c1') {
							updates.push({addr: point.addr, x: start.x * 0.3 + end.x * 0.7, y: start.y * 0.3 + end.y * 0.7});
						} else {
							// always put the current point right at the cursor
							updates.push({addr: point.addr, x: p.x, y: p.y});
						}
					}
					this.$store.commit('updatePoints',{updates: updates});
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
					break;
				case 'z':
					// remove the current segment, close the current subpath, and start a new subpath
					this.deleteCurrentSegment(true, false);
					this.closeSubpath(this.currentSubpath.addr);
					this.pointNameQueue = [];
					e.handled = true;
					break;
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

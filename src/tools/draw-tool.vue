<template>
	<form>
		<h4>Draw Tool</h4>
		<p>Currently Drawing: {{ currentType }}</p>
		<p>
			<template v-for="option in options" >
				<label>
					<input type="radio" name="typeLc" :value="option.typeLc" :checked="option.typeLc == currentTypeLc" />
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
			return this.path ? this.path.lastSubpath : null;
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
		currentPointName: function() {
			return this.pointNameQueue[0];
		},
		currentPoint: function() {
			return (this.currentSegment && this.currentPointName) ? this.currentSegment[this.currentPointName] : null;
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
		newSubpath: function(x,y) {
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
			this.newSegment(subpathAddr);
		},
		newSegment: function(subpathAddr) {
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
					var pointNames = [];
					segmentData.endX = 0;
					break;
				case 'v':
					var pointNames = [];
					segmentData.endY = 0;
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
				var pointData = {parent: segmentAddr, x: 0, y: 0};
				var pointAddr = a.getAddr(pointData);
				segmentData[pointName] = pointAddr;
				this.$store.commit('addPoint',{addr: pointAddr, data: pointData});
			}
			this.$store.commit('addSegment',{addr: segmentAddr, data: segmentData, subpathAddr: subpathAddr, position: 'end'});
			this.pointNameQueue = pointNames;
		},
		click: function(e) {
			var p = this.$app.mouseEventToUser(e);
			if (this.currentPoint) {
				this.$store.commit('updatePoints',{updates:[{addr: this.currentPoint.addr, x: p.x, y: p.y}]});
				this.pointNameQueue.shift();
				if (!this.pointNameQueue.length) {
					this.newSegment(this.currentSubpath.addr);
				}
			} else {
				this.newSubpath(p.x, p.y);
			}
		},
		mousemove: function(e) {
			var p = this.$app.mouseEventToUser(e);
			if (this.currentPoint) {
				this.$store.commit('updatePoints',{updates:[{addr: this.currentPoint.addr, x: p.x, y: p.y}]});
			}
		}
	},
	mounted: function() {
		this.$app.$on('editorClick', this.click);
		this.$app.$on('editorMousemove', this.mousemove);
	},
	destroyed: function() {
		this.$app.$off('editorClick', this.click);
		this.$app.$off('editorMousemove', this.mousemove);
	}
};

</script>

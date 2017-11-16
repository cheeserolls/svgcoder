import _ from 'lodash';
import Vue from 'vue';
import store from '../store/store.js';
import geom from './geom.js';
import cache from './cache.js';
export default Vue.extend({
	store: store,
	props: ['addr'],
	computed: {
		data: function() {
			var data = this.$store.state.drawing.subpaths[this.addr];
			if (data == null) {throw new ReferenceError('No subpath in store with address '+this.addr);}
			return data;
		},
		segments: function() {
			return this.data.segments.map( segmentAddr => cache.get('segments', segmentAddr) );
		},
		path: function() {
			return cache.get('paths',this.data.parent);
		},
		index: function() {
			return this.path.data.subpaths.indexOf(this.addr);
		},
		prev: function() {
			var addr = this.path.data.segments[this.index - 1];
			return addr ? cache.get('subpath',addr) : null;
		},
		next: function() {
			var addr = this.path.data.segments[this.index + 1];
			return addr ? cache.get('subpath',addr) : null;
		},
		firstSegment: function() {
			var segmentAddr = this.data.segments[0];
			return segmentAddr ? cache.get('segments', segmentAddr) : null;
		},
		lastSegment: function() {
			var segmentAddr = this.data.segments[this.data.segments.length - 1];
			return segmentAddr ? cache.get('segments', segmentAddr) : null;
		},
		start: function() {
			return cache.get('points', this.data.start);
		},
		end: function() {
			return this.lastSegment ? this.lastSegment.end : this.start;
		},
		d: function() {
			if (this.data.relative) {
				var currentPoint = this.prev ? this.prev.end : {x: 0, y: 0};
				var values = ['m', this.start.x - currentPoint.x, this.start.y - currentPoint.y];
			} else {
				var values = ['M', this.start.x, this.start.y];
			}
			return _.reduce( this.segments, function(valuesSoFar, segment) {
				return valuesSoFar.concat( segment.d );
			}, values );
		}
	},
	methods: {
		moveStart: function(x, y) {
			this.$store.commit('updatePointData',{addr: this.data.start, name: 'x', value: x});
			this.$store.commit('updatePointData',{addr: this.data.start, name: 'y', value: y});
			return true;
		},
		addSegment: function(type, endX, endY) {
			if (this.lastSegment && this.lastSegment.typeLc == 'z') {
				throw new Error('Cannot add a new segment to this subpath because it is closed');
			}

			var typeLc = type.toLowerCase();
			var a = this.$app.$drawingAddresser;
			var segmentData = {parent: this.addr, type: type};
			var segmentAddr = a.getAddr(segmentData);
			var start = this.end;

			var pointNames = [];
			if (_.includes(['c','q'],typeLc)) {pointNames.push('c0');}
			if (_.includes(['c','s'],typeLc)) {pointNames.push('c1');}
			if (_.includes(['l','c','s','q','t','a'],newTypeLc)) {pointNames.push('end');}

			for (var pointName of pointNames) {
				var pointData = {x: endX, y: endY};
				var pointAddr = a.getAddr(pointData);
				segmentData[pointName] = pointAddr;
				this.$store.commit('addPoint',{addr: pointAddr, data: pointData});
			}

			if (typeLc == 'h') {
				segmentData.endX = endX;
			}
			if (typeLc == 'v') {
				segmentData.endY = endY;
			}
			if (typeLc == 'a') {
				var radius = geom.distance(start, {x:endX, y:endY}) * 0.5;
				segmentData.radiusX = radius;
				segmentData.radiusY = radius;
				segmentData.rot = 0;
				segmentData.arc = 0;
				segmentData.sweep = 0;
			}

			this.$store.commit('addSegment',{addr: segmentAddr, data: segmentData, subpathAddr: subpathAddr, position: 'end'});
			this.$store.commit('updateSubpathData',{addr: this.addr, name: 'segments', value: _.concat(this.data.segments, segmentAddr)});
			return segmentAddr;

		},
		deleteSegment: function(index) {
			var segmentAddr = this.data.segments[index];
			if (!segmentAddr) {return;}
			var segment = cache.get('segments', segmentAddr);
			segment.delete();
			this.$store.commit('updateSubpathData',{addr: this.addr, name: 'segments', value: _.without(this.data.segments, segmentAddr)});
		},
		delete: function() {
			// Note this should not be called directly - instead call from via the path - pathObj.deleteSubpath(index)
			// Delete start child point
			this.start.delete();
			// Delete child segments
			for (var segment of this.segments) {
				segment.delete();
			}
			// Remove from store
			this.$store.commit('deleteSubpath',{addr: this.addr});
			// Remove from cache
			cache.delete('subpaths',this.addr);
			// Call component destroy function to clean up connections with other vms
			this.$destroy();
		}
	}
});

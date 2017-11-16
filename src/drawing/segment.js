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
			var data = this.$store.state.drawing.segments[this.addr];
			if (data == null) {throw new ReferenceError('No segment in store with address '+this.addr);}
			return data;
		},
		type: function() {
			return this.data.type;
		},
		typeLc: function() {
			return this.type.toLowerCase();
		},
		relative: function() {
			return (this.type == this.typeLc);
		},
		subpath: function() {
			return cache.get('subpaths',this.data.parent);
		},
		index: function() {
			return this.subpath.data.segments.indexOf(this.addr);
		},
		prev: function() {
			var addr = this.subpath.data.segments[this.index - 1];
			return addr ? cache.get('segments',addr) : null;
		},
		next: function() {
			var addr = this.subpath.data.segments[this.index + 1];
			return addr ? cache.get('segments',addr) : null;
		},
		start: function() {
			return this.prev ? this.prev.end : this.subpath.start;
		},
		end: function() {
			switch(this.type) {
				case 'h': case 'H':
					return {x: this.data.endX, y: this.start.y};
				case 'v': case 'V':
					return {x: this.start.x, y: this.data.endY};
				case 'z': case 'Z':
					return this.subpath.start;
				default:
					return cache.get('points',this.data.end);
			}
		},
		c0: function() {
			return this.data.c0 ? cache.get('points',this.data.c0) : null;
		},
		c1: function() {
			return this.data.c1 ? cache.get('points',this.data.c1) : null;
		},
		s0: function() {
			var prev = this.prev;
			var c = this.prev ? ( this.prev.c1 || this.prev.c0 || null ) : null;
			if (!c) { return null; }
			var start = this.start;
			return {x: start.x + start.x - c.x, y: start.y + start.y - c.y};
		},
		absoluteValues: function() {
			return this.calculateValues(false);
		},
		relativeValues: function() {
			return this.calculateValues(true);
		},
		d: function() {
			return this.calculateValues(this.relative);
		},
		selected: function() {
			return _.includes(this.$store.state.editor.selectedSegments, this.addr);
		},

		/***** Arc Stuff *****/
		// The details of this algorithm are explained here
		// https://www.w3.org/TR/SVG/implnote.html#ArconversionEndpointToCenter
		// calculations are made simpler by a transformation which places the origin at the midpoint of line from start->end...
		// ...followed by rotation to line up coordinate axes with ellipse axes
		// I'll put underscores before and after a variable to indicate that it's in the transformed coordinates
		cosRot: function() {
			if ( this.typeLc != 'a' ) {return false;}
			return Math.cos(this.data.rot * Math.PI / 180);
		},
		sinRot: function() {
			if ( this.typeLc != 'a' ) {return false;}
			return Math.sin(this.data.rot * Math.PI / 180);
		},
		_start_: function() {
			if ( this.typeLc != 'a' ) {return false;}
			var mid = {x: (this.start.x - this.end.x) * 0.5, y: (this.start.y - this.end.y) * 0.5};
			return {x: this.cosRot * mid.x + this.sinRot * mid.y, y: -this.sinRot * mid.x + this.cosRot * mid.y};
		},
		radiiCheck: function() {
			if ( this.typeLc != 'a' ) {return false;}
			var px2 = this._start_.x * this._start_.x;
			var py2 = this._start_.y * this._start_.y;
			var rx2 = this.data.radiusX * this.data.radiusX;
			var ry2 = this.data.radiusY * this.data.radiusY;
			return Math.sqrt(px2 / rx2 + py2 / ry2);
		},
		rx: function() {
			if ( this.typeLc != 'a' ) {return false;}
			// ensure radii are large enough
			return (this.radiiCheck > 1) ? this.data.radiusX * this.radiiCheck : this.data.radiusX;
		},
		ry: function() {
			if ( this.typeLc != 'a' ) {return false;}
			// ensure radii are large enough
			return (this.radiiCheck > 1) ? this.data.radiusY * this.radiiCheck : this.data.radiusY;
		},
		_arcCenter_: function() {
			if ( this.typeLc != 'a' ) {return false;}

			var px2 = this._start_.x * this._start_.x;
			var py2 = this._start_.y * this._start_.y;
			var rx2 = this.rx * this.rx;
			var ry2 = this.ry * this.ry;

			// calculate center in new coords
			var t1 = rx2 * ry2 - rx2 * py2 - ry2 * px2;
			var t2 = rx2 * py2 + ry2 * px2;
			var t3 = (this.data.arc == this.data.sweep ? -1 : 1) * Math.sqrt( Math.max(t1 / t2, 0) ); // max here required in case rounding error takes this value below
			return {
				x: t3 * this.rx * this._start_.y / this.ry,
				y: -t3 * this.ry * this._start_.x / this.rx
			};
		},
		arcCenter: function() {
			if ( this.typeLc != 'a' ) {return false;}

			// transform back to give us the center of the ellipse
			return {
				x: this.cosRot * this._arcCenter_.x - this.sinRot * this._arcCenter_.y + (this.start.x + this.end.x) * 0.5,
				y: this.sinRot * this._arcCenter_.x + this.cosRot * this._arcCenter_.y + (this.start.y + this.end.y) * 0.5
			};
		},
		_startDirection_: function() {
			if ( this.typeLc != 'a' ) {return false;}
			return {
				x: (this._start_.x - this._arcCenter_.x) / this.rx,
				y: (this._start_.y - this._arcCenter_.y) / this.ry
			};
		},
		_endDirection_: function() {
			if ( this.typeLc != 'a' ) {return false;}
			return {
				x: (-this._start_.x - this._arcCenter_.x) / this.rx,
				y: (-this._start_.y - this._arcCenter_.y) / this.ry
			};
		},
		startAngle: function() {
			return geom.angleBetween({x:1, y:0}, this._startDirection_ );
		},
		sweepAngle: function() {
			if ( this.typeLc != 'a' ) {return false;}
			var sweepAngle = geom.angleBetween(this._startDirection_, this._endDirection_);
			if (!this.data.sweep && sweepAngle > 0) {
				sweepAngle -= 2*Math.PI;
			} else if (this.data.sweep && sweepAngle < 0) {
				sweepAngle += 2*Math.PI;
			}
			return sweepAngle;
		},
		endAngle: function() {
			if ( this.typeLc != 'a' ) {return false;}
			return this.startAngle + this.endAngle;
		},
		arcVertex0: function() {
			if ( this.typeLc != 'a' ) {return false;}
			return {x: this.cosRot * this.rx + this.center.x, y: this.sinRot * this.rx + this.center.y};
		},
		arcVertex1: function() {
			if ( this.typeLc != 'a' ) {return false;}
			return {x: -this.sinRot * this.ry + this.center.x, y: this.cosRot * this.ry + this.center.y};
		}
	},
	methods: {

		/**** Arc stuff *****/
		arcRotatePoint: function(pt) {
			return {x: this.cosRot * pt.x - this.sinRot * pt.y, y: this.sinRot * pt.x + this.cosRot * pt.y};
		},
		arcReverseRotatePoint: function(pt) {
			return {x: this.cosRot * pt.x + this.sinRot * pt.y, y: -this.sinRot * pt.x + this.cosRot * pt.y};
		},
		ellipticalToUserCoords: function(elPt) {
			var temp = this.arcRotatePoint(elPt);
			return {x: temp.x + this.center.x, y: temp.y + this.center.y};
		},
		userToEllipticalCoords: function(userPt) {
			var temp = {x: userPt.x - this.center.x, y: userPt.y - this.center.y};
			return this.arcReverseRotatePoint(temp);
		},

		movePoint: function(pointName, x, y) {
			if (!_.includes(['start','c0','c1','end'], pointName)) {
				throw new RangeError(`Unrecognised point name ${pointName}`);
			}
			if (this.typeLc == 'h' && pointName == 'end') {
				this.$store.commit('updateSegmentData',{addr: this.addr, name: 'endX', value: x});
				return true;
			}
			if (this.typeLc == 'v' && pointName == 'end') {
				this.$store.commit('updateSegmentData',{addr: this.addr, name: 'endY', value: y});
				return true;
			}
			if (pointName == 'start') {
				if (this.prev) {
					return this.prev.movePoint('end', x, y);
				} else {
					return this.subpath.moveStart(x, y);
				}
			}
			var pointAddr = this.data[pointName];
			if (pointAddr == null) {
				throw new RangeError(`Segment type ${this.type} has no point called ${pointName}`);
			}
			// Otherwise it's a regular point
			this.$store.commit('updatePointData',{addr: pointAddr, name: 'x', value: x});
			this.$store.commit('updatePointData',{addr: pointAddr, name: 'y', value: y});
			return true;
		},
		calculateValues: function(relative) {

			var values = [ relative ? this.typeLc : this.type.toUpperCase() ];

			if (_.includes(['c','q'],this.typeLc)) {
				values.push( this.c0.x - ( relative ? this.start.x : 0 ) );
				values.push( this.c0.y - ( relative ? this.start.y : 0 ) );
			}
			if (_.includes(['c','s'],this.typeLc)) {
				values.push( this.c1.x - ( relative ? this.start.x : 0 ) );
				values.push( this.c1.y - ( relative ? this.start.y : 0 ) );
			}
			if (this.typeLc == 'a') {
				values.push( this.data.radiusX );
				values.push( this.data.radiusY );
				values.push( this.data.rot );
				values.push( this.data.arc );
				values.push( this.data.sweep );
			}
			if (_.includes(['l','c','s','q','t','a'],this.typeLc)) {
				values.push( this.end.x - ( relative ? this.start.x : 0 ) );
				values.push( this.end.y - ( relative ? this.start.y : 0 ) );
			}
			if (this.typeLc == 'h') {
				values.push( this.data.endX - ( relative ? this.start.x : 0 ) );
			}
			if (this.typeLc == 'v') {
				values.push( this.data.endY - ( relative ? this.start.y : 0 ) );
			}

			return values;
		},
		positionAt: function(t) {
			switch (this.typeLc) {
				case 'l': case 'h': case 'v': case 'z':
					return geom.interpolate(t, this.start, this.end);
				case 'c':
					return geom.interpolate(t, this.start, this.c0, this.c1, this.end);
				case 's':
					return geom.interpolate(t, this.start, this.s0, this.c1, this.end);
				case 'q':
					return geom.interpolate(t, this.start, this.c0, this.end);
				case 't':
					return geom.interpolate(t, this.start, this.s0, this.end);
				case 'a':
					var angle = this.startAngle + (t * this.sweepAngle);
					return this.ellipticalToUserCoords({x: this.rx * Math.cos(angle), y: this.ry * Math.sin(angle)});
			}
		},
		changeType: function(newType) {
			var newTypeLc = newType.toLowerCase();
			if (newTypeLc == 'z' && this.next) {
				throw new Error('Not last segment in subpath - Cannot change segment type to '+newType);
			}
			if (newTypeLc == 's' && (!this.prev || !_.includes(['c','s'], this.prev.type))) {
				throw new Error('Segment type c must follow from a segment type c or s');
			}
			if (newTypeLc == 't' && (!this.prev || !_.includes(['q'], this.prev.type))) {
				throw new Error('Segment type t must follow from a segment type q');
			}
			if (this.type == newType) {return;}
			this.$store.commit('updateSegmentData', {addr: this.addr, name:'type', value: newType});
			if (this.typeLc == newTypeLc) {return;}

			var a = this.$app.$drawingAddresser;
			var mightHave = ['c0','c1','end'];
			var shouldHave = [];
			if (_.includes(['c','q'],newTypeLc)) {shouldHave.push('c0');}
			if (_.includes(['c','s'],newTypeLc)) {shouldHave.push('c1');}
			if (_.includes(['l','c','s','q','t','a'],newTypeLc)) {shouldHave.push('end');}

			for (var pointName of _.difference(mightHave, shouldHave)) {
				if (this.data[pointName]) {
					this[pointName].delete();
					this.$store.commit('removeSegmentData', {addr: this.addr, name: pointName});
				}
			}
			if (!this.data.c0 && _.includes(shouldHave,'c0')) {
				var pos = _.includes(['s','t'],this.typeLc) ? this.s0 : this.positionAt( newTypeLc=='c' ? 1/3 : 1/2 );
				var data = {x: pos.x, y: pos.y};
				var addr = a.getAddr(data);
				this.$store.commit('addPoint',{addr: addr, data: data});
				this.$store.commit('updateSegmentData', {addr: this.addr, name:'c0', value: addr});
			}
			if (!this.data.c1 && _.includes(shouldHave,'c1')) {
				var pos = this.positionAt( 2/3 );
				var data = {x: pos.x, y: pos.y};
				var addr = a.getAddr(data);
				this.$store.commit('addPoint',{addr: addr, data: data});
				this.$store.commit('updateSegmentData', {addr: this.addr, name:'c1', value: addr});
			}
			if (!this.data.end && _.includes(shouldHave,'end')) {
				var data = {x: this.end.x, y: this.end.y};
				var addr = a.getAddr(data);
				this.$store.commit('addPoint',{addr: addr, data: data});
				this.$store.commit('updateSegmentData', {addr: this.addr, name:'end', value: addr});
			}
			if (newTypeLc=='h') {
				this.$store.commit('updateSegmentData', {addr: this.addr, name:'endX', value: this.end.x});
			} else {
				this.$store.commit('removeSegmentData', {addr: this.addr, name:'endX'});
			}
			if (newTypeLc=='v') {
				this.$store.commit('updateSegmentData', {addr: this.addr, name:'endY', value: this.end.y});
			} else {
				this.$store.commit('removeSegmentData', {addr: this.addr, name:'endY'});
			}
			if (newTypeLc=='a') {
				var radius = geom.distance(this.start, this.end) * 0.5;
				this.$store.commit('updateSegmentData', {addr: this.addr, name:'radiusX', value: radius});
				this.$store.commit('updateSegmentData', {addr: this.addr, name:'radiusY', value: radius});
				this.$store.commit('updateSegmentData', {addr: this.addr, name:'rot', value: 0});
				this.$store.commit('updateSegmentData', {addr: this.addr, name:'arc', value: 0});
				this.$store.commit('updateSegmentData', {addr: this.addr, name:'sweep', value: 0});
			} else {
				this.$store.commit('removeSegmentData', {addr: this.addr, name:'radiusX'});
				this.$store.commit('removeSegmentData', {addr: this.addr, name:'radiusY'});
				this.$store.commit('removeSegmentData', {addr: this.addr, name:'rot'});
				this.$store.commit('removeSegmentData', {addr: this.addr, name:'arc'});
				this.$store.commit('removeSegmentData', {addr: this.addr, name:'sweep'});
			}
		},
		delete: function() {
			// Note this should not be called directly - instead call from via the subpath - subpathObj.deleteSegment(index)
			// Deselect (if selected)
			this.$store.commit('updateSelection',{action: 'remove', segments:[this.addr]});
			// Delete child points
			for (var pointName of ['c0','c1','end']) {
				if (this.data[pointName]) {
					this[pointName].delete();
				}
			}
			// Remove from store
			this.$store.commit('deleteSegment',{addr: this.addr});
			// Remove from cache
			cache.delete('segments',this.addr);
			// Call component destroy function to clean up connections with other vms
			this.$destroy();
		}
	}
});

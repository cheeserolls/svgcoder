var Wrappers = {};

let map = new WeakMap();

let state;

let Path = function(addr) {
	Object.defineProperty(this, 'addr', {enumerable: true, value:addr, writable:false});
};

Object.defineProperty(Path.prototype, 'data', {enumerable: true, get: function(){
	return state.nodes[this.addr];
}});

Object.defineProperty(Path.prototype, 'subpaths', {enumerable: true, get: function(){
	return this.data.subpaths.map(addr => {return new Subpath(addr);});
}});

let Subpath = function(addr) {
	Object.defineProperty(this, 'addr', {enumerable: true, value:addr, writable:false});
};

Object.defineProperty(Subpath.prototype, 'data', {enumerable: true, get: function(){
	return state.subpaths[this.addr];
}});

Object.defineProperty(Subpath.prototype, 'segments', {enumerable: true, get: function(){
	return this.data.segments.map(addr => {return new Segment(addr);});
}});

Object.defineProperty(Subpath.prototype, 'start', {enumerable: true, get: function(){
	return new Point(this.data.start);
}});

let Point = function(addr) {
	Object.defineProperty(this, 'addr', {enumerable: true, value:addr, writable:false});
};

Object.defineProperty(Point.prototype, 'data', {enumerable: true, get: function(){
	return state.points[this.addr];
}});

Object.defineProperty(Point.prototype, 'x', {enumerable: true, get: function(){
	return this.data.x;
}});

Object.defineProperty(Point.prototype, 'y', {enumerable: true, get: function(){
	return this.data.y;
}});

Object.defineProperty(Point.prototype, 'parent', {enumerable: true, get: function(){
	var addr = this.data.parent;
	if (state.segments[addr]) {
		return new Segment(addr);
	} else if (state.subpaths[addr]) {
		return new Subpath(addr);
	} else {
		return null;
	}
}});

let Segment = function(addr) {
	Object.defineProperty(this, 'addr', {enumerable: true, value:addr, writable:false});
};

Object.defineProperty(Segment.prototype, 'data', {enumerable: true, get: function(){
	return state.segments[this.addr];
}});

Object.defineProperty(Segment.prototype, 'type', {enumerable: true, get: function(){
	return this.data.type;
}});

Object.defineProperty(Segment.prototype, 'subpath', {enumerable: true, get: function(){
	return new Subpath(this.data.parent);
}});

Object.defineProperty(Segment.prototype, 'index', {enumerable: true, get: function(){
	return this.subpath.data.segments.indexOf(this.addr);
}});

Object.defineProperty(Segment.prototype, 'prev', {enumerable: true, get: function(){
	var addr = this.subpath.data.segments[this.index - 1];
	return state.segments[addr] ? new Segment(addr) : null;
}});

Object.defineProperty(Segment.prototype, 'next', {enumerable: true, get: function(){
	var addr = this.subpath.data.segments[this.index + 1];
	return state.segments[addr] ? new Segment(addr) : null;
}});

Object.defineProperty(Segment.prototype, 'start', {enumerable: true, get: function(){
	var prev = this.prev;
	return prev ? prev.end : this.subpath.start;
}});

Object.defineProperty(Segment.prototype, 'end', {enumerable: true, get: function(){
	switch(this.data.type) {
		case 'h': case 'H':
			return {x: this.data.endX, y: this.start.y};
		case 'v': case 'V':
			return {x: this.start.x, y: this.data.endY};
		case 'z': case 'Z':
			return this.subpath.start;
		default:
			return new Point(this.data.end);
	}
}});

Object.defineProperty(Segment.prototype, 'c0', {enumerable: true, get: function(){
	return this.data.c0 ? new Point(this.data.c0) : null;
}});

Object.defineProperty(Segment.prototype, 'c1', {enumerable: true, get: function(){
	return this.data.c1 ? new Point(this.data.c1) : null;
}});


var angleBetween = function(u, v) {
	return Math.sign( u.x * v.y - u.y * v.x ) * Math.acos( u.x * v.x + u.y * v.y / Math.sqrt( ( u.x * u.x + u.y * u.y ) * ( v.x * v.x + v.y * v.y ) ) );
};

Segment.prototype.setArcData = function() {

	// Do all the intermediate calculations for working with points on the arc
	var d = this.data;
	if ( d.type !== 'a' && d.type !== 'A' ) {
		return;
	}
	var start = this.start;
	var end = this.end;

	var rotRadians = d.rot * Math.PI / 180;
	var c = Math.cos(rotRadians);
	var s = Math.sin(rotRadians);
	var rx = d.radiusX;
	var ry = d.radiusY;

	// First we'll calculate the centre of the ellipse
	// The details of this algorithm are explained here
	// https://www.w3.org/TR/SVG/implnote.html#ArconversionEndpointToCenter

	// transformation which places the origin at the midpoint of line from start->end followed by rotation to line up coordinate axes with ellipse axes
	// I'll put underscores before and after a variable to indicate that it's in the transformed coordinates
	var mid = {x: (start.x - end.x) * 0.5, y: (start.y - end.y) * 0.5};
	var _start_ = {x: c * mid.x + s * mid.y, y: -s * mid.x + c * mid.y};

	var px2 = _start_.x * _start_.x;
	var py2 = _start_.y * _start_.y;
	var rx2 = rx * rx;
	var ry2 = ry * ry;

	// ensure radii are large enough
	var radiiCheck = px2 / rx2 + py2 / ry2;
	if (radiiCheck > 1) {
		var radiiCheckSqrt = Math.sqrt(radiiCheck);
		rx = rx * radiiCheckSqrt;
		ry = ry * radiiCheckSqrt;
		rx2 = rx2 * radiiCheck;
		ry2 = ry2 * radiiCheck;
	}

	// calculate center in new coords
	var t1 = rx2 * ry2 - rx2 * py2 - ry2 * px2;
	var t2 = rx2 * py2 + ry2 * px2;
	var t3 = (d.arc == d.sweep ? -1 : 1) * Math.sqrt( Math.max(t1 / t2, 0) ); // max here required in case rounding error takes this value below
	var _center_ = {x: t3 * rx * _start_.y / ry, y: -t3 * ry * _start_.x / rx};

	// transform back to give us the center of the ellipse
	this.center = {x: c * _center_.x - s * _center_.y + (start.x + end.x) * 0.5, y: s * _center_.x + c * _center_.y + (start.y + end.y) * 0.5};

	// Now calculate the angles defining the portion of the ellipse which makes up the arc
	var _startDirection_ = {x: (_start_.x - _center_.x) / rx, y: (_start_.y - _center_.y) / ry};
	var _endDirection_ = {x: (-_start_.x - _center_.x) / rx, y: (-_start_.y - _center_.y) / ry};
	this.startAngle = angleBetween({x:1, y:0}, _startDirection_ );
	this.sweepAngle = angleBetween(_startDirection_, _endDirection_);
	if (!d.sweep && this.sweepAngle > 0) {
		this.sweepAngle -= 2*Math.PI;
	} else if (d.sweep && this.sweepAngle < 0) {
		this.sweepAngle += 2*Math.PI;
	}
	this.endAngle = this.startAngle + this.endAngle;

	// Save utility functions
	this.rotate = (pt) => {
		return {x: c * pt.x - s * pt.y, y: s * pt.x + c * pt.y};
	};
	this.reverseRotate = (pt) => {
		return {x: c * pt.x + s * pt.y, y: -s * pt.x + c * pt.y};
	};
	this.ellipticalToUserCoords = (elPt) => {
		var temp = this.rotate(elPt);
		return {x: temp.x + this.center.x, y: temp.y + this.center.y};
	};
	this.userToEllipticalCoords = (userPt) => {
		var temp = {x: userPt.x - this.center.x, y: userPt.y - this.center.y};
		return this.reverseRotate(temp);
	};
	this.arcPointAt = (t) => {
		var angle = this.startAngle + (t * this.sweepAngle);
		return this.ellipticalToUserCoords({x: rx * Math.cos(angle), y: ry * Math.sin(angle)});
	};

	// Calculate the position of the mid point on the arc - this will be the rotation control
	this.rotationHandle = this.arcPointAt(0.5);

	// Calculate the radius handle points
	this.radiusHandle = this.ellipticalToUserCoords({x: rx, y: ry});

	// Calculate the 2 vertex points
	this.vertex0 = {x: c * rx + this.center.x, y: s * rx + this.center.y};
	this.vertex1 = {x: -s * ry + this.center.x, y: c * ry + this.center.y};

};

Wrappers.setState = function(obj) {
	state = obj;
};

Wrappers.point = function(addr) { return new Point(addr); };
Wrappers.subpath = function(addr) { return new Subpath(addr); };
Wrappers.segment = function(addr) { return new Segment(addr); };
Wrappers.path = function(addr) { return new Path(addr); };

export default Wrappers;

/*

normal point

onmove: function(location) {
	commit update points this.point -> location;
}


H/h endpoint

onmmove: function(location) {
	commit update segment this.segment.endX -> location.x
}

V/v endpoint

position: function() {

}
onmove: function(location) {
	commit update segment this.segment.endY -> location.y
}

movetool:
	selected markers -> move(new marker location)

rotatetool:
	selected markers -> move(new marker location)



segment.start() {
	return this.prev ? this.prev.end() : this.suubpath.start();
}
segment.end() {
	return this.end
}
h-segment.end() {
	return this.endX, this.subpath.start.y
}
v-segment.end() {
	return this.subpath.start.x, this.endY
}
z-segment.end() {
	return this.subpath.start
}


var Segment = new function(addr, state) {
	this.addr = addr;
	this.state = state;
};
Segment.data -> this.state.segments[this.addr];
Segment.type -> this.data.type;
Segment.subpath -> Subpath(this.data.parent, this.state);
Segment.path -> this.state.nodes[this.]

*/

var Wrappers = {};

let map = new WeakMap();

let internal = function (object) {
	if (!map.has(object)) {
		map.set(object, {});
	}
	return map.get(object);
};

let state;

Wrappers.setState = function(obj) {
	state = obj;
};

let Point = function(addr) {
	Object.defineProperty(this, 'addr', {enumerable: true, value:addr, writable:false});
};

Object.defineProperty(Point.prototype, 'data', {enumerable: true, get: function(){
	return state.points[this.addr];
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

Object.defineProperty(Segment.prototype, 'subpath', {enumerable: true, get: function(){
	return new Subpath(this.data.parent);
}});

Object.defineProperty(Segment.prototype, 'index', {enumerable: true, get: function(){
	return this.subpath.segments.indexOf(this.addr);
}});

Object.defineProperty(Segment.prototype, 'prev', {enumerable: true, get: function(){
	var addr = this.subpath.segments[this.index - 1];
	return state.segments[addr] ? new Segment(addr) : null;
}});

Object.defineProperty(Segment.prototype, 'next', {enumerable: true, get: function(){
	var addr = this.subpath.segments[this.index + 1];
	return state.segments[addr] ? new Segment(addr) : null;
}});

Object.defineProperty(Segment.prototype, 'start', {enumerable: true, get: function(){
	var prev = this.prev;
	return prev ? prev.end : this.subpath.start;
}});

Object.defineProperty(Segment.prototype, 'end', {enumerable: true, get: function(){
	switch(this.data.type) {
		case 'v': case 'V':
			return {x: this.data.endX, y: this.start.y};
		case 'h': case 'H':
			return {x: this.start.x, y: this.data.endY};
		case 'z': case 'Z':
			return this.subpath.start;
		default:
			return new Point(this.data.end);
	}
}});



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

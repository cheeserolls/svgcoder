import Point from './point.js';
import Path from './path.js';
import Segment from './segment.js';
import Subpath from './subpath.js';

var cache = {
	points: {},
	paths: {},
	subpaths: {},
	segments: {}
};
var typeMap = {
	points: Point,
	paths: Path,
	subpaths: Subpath,
	segments: Segment
};

export default {
	get: function(type, addr) {
		if (!cache[type][addr]) {
			cache[type][addr] = new typeMap[type]({propsData: {addr: addr}});
		}
		return cache[type][addr];
	},
	delete: function(type, addr) {
		if (cache[type][addr]) {
			delete cache[type][addr];
		}
	}
};

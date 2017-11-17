import store from '../store/store.js';
import Element from './element.js';
import Point from './point.js';
import Path from './path.js';
import Segment from './segment.js';
import Subpath from './subpath.js';

var cache = {}

var typeMap = {
	point: Point,
	path: Path,
	subpath: Subpath,
	segment: Segment
};

export default {
	get: function(addr, nodeName) {
		if (!cache[addr]) {
			var nodeData = store.state.drawing.nodes[addr];
			if (nodeData == null) {throw new ReferenceError(`No node in store with address ${addr}`);}
			if (nodeName && nodeData.nodeName !== nodeName) {throw new ReferenceError(`Node is not a ${nodeName} at address ${addr}`);}
			var _class = typeMap[nodeData.nodeName] || Element;
			cache[addr] = new _class({propsData: {addr: addr}});
		}
		return cache[addr];
	},
	delete: function(addr) {
		if (cache[addr]) {
			delete cache[addr];
		}
	}
};

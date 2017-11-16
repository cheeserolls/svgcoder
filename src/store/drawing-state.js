import Vue from 'vue';
export default {
	state: {
		viewbox: {
			x: 0,
			y: 0,
			width: 100,
			height: 100
		},
		rootNode: '~',
		points: {},
		segments: {},
		subpaths: {},
		nodes: {'~':{type:'svg'}}
	},
	mutations: {
		replaceEntireDrawing: function(state, payload) {
			state.viewbox = payload.viewbox;
			state.rootNode = payload.rootNode;
			state.points = payload.points;
			state.segments = payload.segments;
			state.subpaths = payload.subpaths;
			state.nodes = payload.nodes;
		},
		updateNodeData: function(state, payload) {
			state.nodes[payload.addr][payload.name] = payload.value;
		},
		updateSubpathData: function(state, payload) {
			state.subpaths[payload.addr][payload.name] = payload.value;
		},
		updateSegmentData: function(state, payload) {
			state.segments[payload.addr][payload.name] = payload.value;
		},
		updatePointData: function(state, payload) {
			state.points[payload.addr][payload.name] = payload.value;
		},
		updatePoints: function(state, payload) {
			for (var update of payload.updates) {
				var p = state.points[update.addr];
				p.x = update.x;
				p.y = update.y;
			}
		},
		removeNodeData: function(state, payload) {
			delete state.nodes[payload.addr][payload.name];
		},
		removeSubpathData: function(state, payload) {
			delete state.subpaths[payload.addr][payload.name];
		},
		removeSegmentData: function(state, payload) {
			delete state.segments[payload.addr][payload.name];
		},
		addNode: function(state, payload) {
			Vue.set( state.nodes, payload.addr, payload.data );
		},
		addSubpath: function(state, payload) {
			Vue.set( state.subpaths, payload.addr, payload.data );
		},
		addSegment: function(state, payload) {
			Vue.set( state.segments, payload.addr, payload.data );
		},
		addPoint: function(state, payload) {
			Vue.set( state.points, payload.addr, payload.data );
		},
		deleteNode: function(state, payload) {
			delete state.nodes[payload.addr];
		},
		deleteSubpath: function(state, payload) {
			delete state.subpaths[payload.addr];
		},
		deleteSegment: function(state, payload) {
			delete state.segments[payload.addr];
		},
		deletePoint: function(state, payload) {
			delete state.points[payload.addr];
		},
	}
};

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
		updatePoints: function(state, payload) {
			for (var update of payload.updates) {
				var p = state.points[update.addr];
				p.x = update.x;
				p.y = update.y;
			}
		},
		updateSegmentData: function(state, payload) {
			state.segments[payload.addr][payload.name] = payload.value;
		},
		addNode: function(state, payload) {
			Vue.set( state.nodes, payload.addr, payload.data );
			var parentAddr = payload.parentAddr ? payload.parentAddr : state.rootNode;
			var existing = state.nodes[parentAddr].children;
			if ( payload.position == 'end' ) {
				existing.push(payload.addr);
			} else {
				existing.splice(payload.position, 0, payload.addr);
			}
		},
		addSubpath: function(state, payload) {
			Vue.set( state.subpaths, payload.addr, payload.data );
			var existing = state.nodes[payload.pathAddr].subpaths;
			if ( payload.position == 'end' ) {
				existing.push(payload.addr);
			} else {
				existing.splice(payload.position, 0, payload.addr);
			}
		},
		addSegment: function(state, payload) {
			Vue.set( state.segments, payload.addr, payload.data );
			var existing = state.subpaths[payload.subpathAddr].segments;
			if ( payload.position == 'end' ) {
				existing.push(payload.addr);
			} else {
				existing.splice(payload.position, 0, payload.addr);
			}
		},
		addPoint: function(state, payload) {
			Vue.set( state.points, payload.addr, payload.data );
		},
	}
};

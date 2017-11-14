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
		deleteNode: function(state, payload) {
			var parentAddr = state.nodes[payload.addr].parent;
			Vue.delete( state.nodes, payload.addr );
			var existing = state.nodes[parentAddr].children;
			existing.splice(existing.indexOf(payload.addr),1);
			// @todo - delete child nodes too?
		},
		deleteSubpath: function(state, payload) {
			var pathAddr = state.subpaths[payload.addr].parent;
			Vue.delete( state.subpaths, payload.addr );
			var existing = state.paths[pathAddr].subpaths;
			existing.splice(existing.indexOf(payload.addr),1);
			// @todo - delete child nodes too?
		},
		deleteSegment: function(state, payload) {
			var subpathAddr = state.segments[payload.addr].parent;
			Vue.delete( state.segments, payload.addr );
			var existing = state.subpaths[subpathAddr].segments;
			existing.splice(existing.indexOf(payload.addr),1);
			// @todo - delete child nodes too?
		},
		deletePoint: function(state, payload) {
			Vue.delete( state.points, payload.addr );
		},
	}
};

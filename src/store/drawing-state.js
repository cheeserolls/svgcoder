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
		}
	}
};

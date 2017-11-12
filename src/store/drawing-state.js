export default {
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
				/*if ( p.pseudo == 'end' ) {
					var segment = state.segments[p.parent];
					if ( segment.type == 'h' || segment.type == 'H' ) {
						segment.endX = update.x;
					}
					return;
				}
				*/
				p.x = update.x;
				p.y = update.y;
			}
		}
	},
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
	}
};

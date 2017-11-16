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
		nodes: {'~':{type:'svg'}}
	},
	mutations: {
		replaceEntireDrawing: function(state, payload) {
			state.viewbox = payload.viewbox;
			state.rootNode = payload.rootNode;
			state.nodes = payload.nodes;
		},
		addNode: function(state, payload) {
			var node = state.nodes[payload.addr];
			if (node) {throw new RangeError(`Node with address ${payload.addr} already exists`);}
			Vue.set( state.nodes, payload.addr, payload.data );
		},
		updateNodeData: function(state, payload) {
			var node = state.nodes[payload.addr];
			if (!node) {throw new RangeError(`No node exists with address ${payload.addr}`);}
			node[payload.name] = payload.value;
		},
		removeNodeData: function(state, payload) {
			var node = state.nodes[payload.addr];
			if (!node) {throw new RangeError(`No node exists with address ${payload.addr}`);}
			delete node[payload.name];
		},
		updatePoints: function(state, payload) {
			for (var update of payload.updates) {
				var p = state.nodes[update.addr];
				if (!p || p.nodeName !== 'point') {throw new RangeError(`No point exists with address ${update.addr}`);}
				p.x = update.x;
				p.y = update.y;
			}
		},
		deleteNode: function(state, payload) {
			if (!state.nodes[payload.addr]) {throw new RangeError(`No node exists with address ${payload.addr}`);}
			delete state.nodes[payload.addr];
		}
	}
};

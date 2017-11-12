import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import drawingState from './drawing-state.js';
import editorState from './editor-state.js';

export default new Vuex.Store({
	modules: {
		drawing: drawingState,
		editor: editorState
	},
	state: {
		title: 'foo.svg'
	},
	mutations: {
		setDrawingTitle: function(state, payload) {
			state.title = payload.title ? payload.title.toString() : 'untitled';
		},
	}
});

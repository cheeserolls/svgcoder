import _ from 'lodash';
import wrappers from '../util/wrappers.js';
export default {
	state: {
		viewport: {
			pageX: 0,
			pageY: 0,
			width: 100,
			height: 100
		},
		scale: 1,
		canvasOffset: {
			x: 0,
			y: 0
		},
		gridWidth: 1,
		snapToGrid: false,
		selectedMarkers: [],
		selectedPoints: [],
		selectedPaths: [],
		selectedSegments: [],
		tools: [],
		currentToolName: null,
	},
	getters: {
		canvasRect: function(state, getters, rootState) {
			return {
				left: state.canvasOffset.x,
				top: state.canvasOffset.y,
				width: state.scale * rootState.drawing.viewbox.width,
				height: state.scale * rootState.drawing.viewbox.height
			};
		}
	},
	mutations: {
		updateViewport: function(state, payload) {
			if (payload.pageX != null) {state.viewport.pageX = payload.pageX;}
			if (payload.pageY != null) {state.viewport.pageY = payload.pageY;}
			if (payload.width != null) {state.viewport.width = payload.width;}
			if (payload.height != null) {state.viewport.height = payload.height;}
		},
		reposition: function(state, payload) {
			if (payload.scale) {state.scale = payload.scale;}
			if (payload.canvasOffsetX) {state.canvasOffset.x = payload.canvasOffsetX;}
			if (payload.canvasOffsetY) {state.canvasOffset.y = payload.canvasOffsetY;}
		},
		updateGrid: function(state, payload) {
			if ( payload.gridWidth != null ) {state.gridWidth = parseFloat(payload.gridWidth);}
			if ( payload.snapToGrid != null ) {state.snapToGrid = !!payload.snapToGrid;}
		},
		deselect: function(state) {
			state.selectedPaths = [];
			state.selectedPoints = [];
			state.selectedSegments = [];
		},
		updateSelectedPaths: function(state, payload) {
			switch (payload.action) {
				case 'replace':
					state.selectedPaths = payload.paths;
					break;
				case 'add':
					state.selectedPaths = _.union(state.selectedPaths, payload.paths);
					break;
				case 'remove':
					state.selectedPaths = _.difference(state.selectedPaths, payload.paths);
					break;
				case 'deselect':
					state.selectedPaths = [];
					break;
			}
		},
		updateSelectedPoints: function(state, payload) {
			switch (payload.action) {
				case 'replace':
					state.selectedPoints = payload.points;
					break;
				case 'add':
					state.selectedPoints = _.union(state.selectedPoints, payload.points);
					break;
				case 'remove':
					state.selectedPoints = _.difference(state.selectedPoints, payload.points);
					break;
				case 'deselect':
					state.selectedPoints = [];
					break;
			}
		},
		updateSelectedMarkers: function(state, payload) {
			switch (payload.action) {
				case 'replace':
					state.selectedMarkers = payload.points;
					break;
				case 'add':
					state.selectedMarkers = _.union(state.selectedMarkers, payload.markers);
					break;
				case 'remove':
					state.selectedMarkers = _.difference(state.selectedMarkers, payload.markers);
					break;
				case 'deselect':
					state.selectedMarkers = [];
					break;
			}
		},
		selectTool: function(state, payload) {
			state.currentToolName = payload.toolName;
		},
		addTool: function(state,payload) {
			state.tools.push({
				name: payload.name,
				label: payload.label,
				tag: payload.tag ? payload.tag : payload.name + '-tool',
				hotkey: payload.hotkey ? payload.hotkey : null
			});
		}
	}
}

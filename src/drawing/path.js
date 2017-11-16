import _ from 'lodash';
import Vue from 'vue';
import store from '../store/store.js';
import cache from './cache.js';
export default Vue.extend({
	store: store,
	props: ['addr'],
	computed: {
		data: function() {
			var data = this.$store.state.drawing.nodes[this.addr];
			if (data == null) {throw new ReferenceError('No node in store with address '+this.addr);}
			if (data.nodeName !== 'path') {throw new ReferenceError('Node is not a path at address '+this.addr);}
			return data;
		},
		subpaths: function() {
			return this.data.subpaths.map( addr => cache.get('subpaths',addr) );
		},
		firstSubpath: function() {
			var subpathAddr = this.data.subpaths[0];
			return subpathAddr ? cache.get('subpaths', subpathAddr) : null;
		},
		d: function() {
			var values = _.reduce( this.subpaths, function(valuesSoFar, subpath) {
				return valuesSoFar.concat( subpath.d );
			}, [] );
			return values.join(' ');
		},
		selected: function() {
			return _.includes(this.$store.state.editor.selectedPaths, this.addr);
		}
	},
	methods: {
		addSubpath: function(relative, startX, startY) {
			var a = this.$app.$drawingAddresser;
			var subpathData = {nodeName: 'subpath', parent: this.addr, relative: relative, segments:[]};
			var subpathAddr = a.getAddr(subpathData);
			var startData = {nodeName: 'point', parent: subpathAddr, x: startX, y: startY};
			var startAddr = a.getAddr(startData);
			subpathData.start = startAddr;
			this.$store.commit('addNode',{addr: startAddr, data: startData});
			this.$store.commit('addNode',{addr: subpathAddr, data: subpathData});
			this.$store.commit('updateNodeData',{addr: this.addr, name: 'subpaths', value: _.concat(this.data.subpaths, subpathAddr)});
			return subpathAddr;
		},
		deleteSubpath: function(index) {
			var subpathAddr = this.data.subpaths[index];
			if (!subpathAddr) {return;}
			var subpath = cache.get('subpaths', subpathAddr);
			subpath.delete();
			this.$store.commit('updateNodeData',{addr: this.addr, name: 'subpaths', value: _.without(this.data.subpaths, subpathAddr)});
		},
		delete: function() {
			// Note this should not be called directly - instead call from via the parent node - nodeObj.deleteChild(index)
			// Deselect (if selected)
			this.$store.commit('updateSelection',{action: 'remove', paths:[this.addr]});
			// Delete child subpaths
			for (var subpath of this.subpaths) {
				subpath.delete();
			}
			// Remove from store
			this.$store.commit('deleteNode',{addr: this.addr});
			// Remove from cache
			cache.delete('paths',this.addr);
			// Call component destroy function to clean up connections with other vms
			this.$destroy();
		}
	}
});

import _ from 'lodash';
import Vue from 'vue';
import store from '../store/store.js';
import cache from './cache.js';
export default Vue.extend({
	props: ['addr'],
	computed: {
		data: function() {
			var data = store.state.drawing.nodes[this.addr];
			if (data == null) {throw new ReferenceError('No node in store with address '+this.addr);}
			return data;
		},
		parent: function() {
			return this.data.parent ? cache.get(this.data.parent) : null;
		},
		children: function() {
			return this.data.children ? this.data.children.map( addr => cache.get(addr) ) : [];
		}
	},
	methods: {
		addChild: function(childData) {
			childData.parent = this.addr;
			var childAddr = this.$app.$drawingAddresser.getAddr(childData);
			store.commit('addNode',{addr: childAddr, data: childData});
			store.commit('updateNodeData',{addr: this.addr, name: 'children', value: _.union(this.data.children, [childAddr])});
			return childAddr;
		},
		deleteChild: function(index) {
			var childAddr = this.data.children[index];
			if (!childAddr) {return;}
			var child = cache.get(childAddr);
			child.delete();
			store.commit('updateNodeData',{addr: this.addr, name: 'children', value: _.without(this.data.children, childAddr)});
		},
		delete: function() {
			// Note this should not be called directly - instead call from via the parent node - nodeObj.deleteChild(index)
			// Delete children
			for (var child of this.children) {
				child.delete();
			}
			// Remove from store
			store.commit('deleteNode',{addr: this.addr});
			// Remove from cache
			cache.delete(this.addr);
			// Call component destroy function to clean up connections with other vms
			this.$destroy();
		}
	}
});

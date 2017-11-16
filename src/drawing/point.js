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
			if (data.nodeName !== 'point') {throw new ReferenceError('Node is not a point at address '+this.addr);}
			return data;
		},
		x: function() {
			return this.data.x;
		},
		y: function() {
			return this.data.y;
		},
		selected: function() {
			return _.includes(this.$store.state.editor.selectedPoints, this.addr);
		}
	},
	methods: {
		delete: function() {
			// Deselect (if selected)
			this.$store.commit('updateSelection',{action: 'remove', points:[this.addr]});
			// Remove from store
			this.$store.commit('deleteNode',{addr: this.addr});
			// Remove from cache
			cache.delete('points',this.addr);
			// Call component destroy function to clean up connections with other vms
			this.$destroy();
		}
	}
});

<template>
	<form class="selected-segment-info">
		<h4>Selected Segment</h4>
		<p>Type: <select @change="updateType">
			<option v-for="option in options" :selected="option.selected" :value="option.type">{{ option.label }}</option>
		</select></p>
		<template v-if="isArc">
			<p><label>Radius X: <input name="radiusX" type="number" min="0" data-cast="float" :value="data.radiusX"  @input="updateData" /></label></p>
			<p><label>Radius Y: <input name="radiusY" type="number" min="0" data-cast="float" :value="data.radiusY"  @input="updateData" /></label></p>
			<p><label>Rotation: <input name="rot" type="number" data-cast="float" :value="data.rot" @input="updateData" /></label></p>
			<p>Arc:
				<label>Large <input name="arc" type="radio" data-cast="int" value="1" @change="updateData" :checked="!!data.arc" /></label>
				<label>Small <input name="arc" type="radio" data-cast="int" value="0" @change="updateData" :checked="!data.arc" /></label>
			</p>
			<p>Sweep:
				<label>Positive <input name="sweep" type="radio" data-cast="int" value="1" @change="updateData" :checked="!!data.sweep" /></label>
				<label>Negative <input name="sweep" type="radio" data-cast="int" value="0" @change="updateData" :checked="!data.sweep" /></label>
			</p>
		</template>
	</form>
</template>

<script>
import cache from '../drawing/cache.js';
export default {
	props: ['segmentAddr'],
	computed: {
		segment: function() {
			return cache.get(this.segmentAddr, 'segment');
		},
		data: function() {
			return this.segment.data;
		},
		type: function() {
			return this.segment.type;
		},
		isArc: function() {
			return this.type == 'a' || this.type == 'A';
		},
		options: function() {
			var prev = this.segment.prev;
			var prevType = ( prev ? prev.type : 'none' );
			var options = [];

			options.push({type:'L', label:'L - Line (absolute)'});
			options.push({type:'l', label:'l - Line (relative)'});
			options.push({type:'H', label:'H - Horizontal line (absolute)'});
			options.push({type:'h', label:'h - Horizontal line (relative)'});
			options.push({type:'V', label:'V - Vertical line (absolute)'});
			options.push({type:'v', label:'v - Vertical line (relative)'});
			options.push({type:'C', label:'C - Cubic curve (absolute)'});
			options.push({type:'c', label:'c - Cubic curve (relative)'});
			if (prevType == 'C' || prevType == 'c') {
				options.push({type:'S', label:'S - Smooth cubic curve (absolute)'});
				options.push({type:'s', label:'s - Smooth cubic curve (relative)'});
			}
			options.push({type:'Q', label:'Q - Quadratic curve (absolute)'});
			options.push({type:'q', label:'q - Quadratic curve (relative)'});
			if (prevType == 'Q' || prevType == 'q') {
				options.push({type:'T', label:'T - Smooth Quadratic curve (absolute)'});
				options.push({type:'t', label:'t - Smooth Quadratic curve (relative)'});
			}
			options.push({type:'A', label:'A - Arc (absolute)'});
			options.push({type:'a', label:'a - Arc (relative)'});
			if (this.segment.nexr == null) {
				options.push({type:'Z', label:'Z - Close path (absolute)'});
				options.push({type:'z', label:'z - Close path (relative)'});
			}

			for (var i=0; i<options.length; i++) {
				options[i].selected = (this.type == options[i].type);
			}
			return options;
		}
	},
	methods: {
		updateData: function(e) {
			if (e.target.type == 'radio') {
				var form = e.target;
				while( form = form.parentElement ) {
					if (form instanceof HTMLFormElement) {
						var value = form[e.target.name].value;
					}
				}
			} else {
				var value = e.target.value;
			}
			switch (e.target.getAttribute('data-cast')) {
				case 'int':
					value = parseInt(value, 10);
					break;
				case 'float':
					value = parseFloat(value);
					break;
			}
			this.$store.commit('updateNodeData', {addr: this.segmentAddr, name: e.target.name, value: value});
		},
		updateType: function(e) {
			this.segment.changeType(  e.target.options[e.target.selectedIndex].value );
		},
	}
}
</script>

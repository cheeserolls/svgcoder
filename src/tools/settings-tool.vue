<template>
	<div>
		<h3>Settings</h3>
		<p>Title: <input :value="title" @change="updateTitle" /></p>
		<p>Grid Width: <input :value="gridWidth" @change="updateGridWidth" /></p>
		<p>Snap To Grid: <input type="checkbox" :checked="snapToGrid" @change="updateSnapToGrid" /></p>
		<p><a @click="download" :download="title" href="#" >Download SVG File</a></p>
	</div>
</template>

<script>
export default {
	computed: {
		title: function() {
			return this.$store.state.title;
		},
		gridWidth: function() {
			return this.$store.state.editor.gridWidth;
		},
		snapToGrid: function() {
			return this.$store.state.editor.snapToGrid;
		}
	},
	methods: {
		updateTitle: function(e) {
			this.$store.commit('setDrawingTitle',{title:e.target.value});
		},
		updateGridWidth: function(e) {
			this.$store.commit('updateGrid',{gridWidth:e.target.value});
		},
		updateSnapToGrid: function(e) {
			this.$store.commit('updateGrid',{snapToGrid: e.target.checked});
		},
		download: function(e) {
			if (this.downloadUrl) {URL.revokeObjectURL(this.downloadUrl);}
			var blob = new Blob(['<?xml version="1.0" encoding="UTF-8" ?>', this.$app.$editor.$canvas.innerHTML],{type: 'image/svg+xml'});
			this.downloadUrl = URL.createObjectURL(blob);
			e.target.href = this.downloadUrl;
		}
	}
}
</script>

<template>
	<div>
		<h4>Move Tool</h4>
	</div>
</template>

<script>
export default {
	name: 'move-tool',
	computed: {
		selectedPaths: function() {
			return this.$store.state.editor.selectedPaths;
		},
		selectedPoints: function() {
			return this.$store.state.editor.selectedPoints;
		}
	},
	methods: {
		dragstart: function(e) {
			this.clickStart = this.$app.mouseEventToUser(e);
			this.$app.$emit('markerMoveStart',{selected: true});
		},
		dragupdate: function(e) {
			var clickPoint = this.$app.mouseEventToUser(e);
			this.$app.$emit('markerMoveUpdate',{selected: true, dx: clickPoint.x - this.clickStart.x, dy: clickPoint.y - this.clickStart.y});
		},
		dragend: function(e) {
			var clickPoint = this.$app.mouseEventToUser(e);
			this.$app.$emit('markerMoveEnd',{selected: true, dx: clickPoint.x - this.clickStart.x, dy: clickPoint.y - this.clickStart.y});
		}
	},
	mounted: function() {
		this.$app.$on('editorDragstart', this.dragstart);
		this.$app.$on('editorDragupdate', this.dragupdate);
		this.$app.$on('editorDragend', this.dragend);
	},
	destroyed: function() {
		this.$app.$off('editorDragstart', this.dragstart);
		this.$app.$off('editorDragupdate', this.dragupdate);
		this.$app.$off('editorDragend', this.dragend);
	}
};

</script>

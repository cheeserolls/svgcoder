<template>
	<div>
		<h4>Viewport Tool</h4>
		<p><button @click="fitDrawing">Fit Drawing</button></p>
	</div>
</template>

<script>
export default {
	name: 'viewport-tool',
	data: function() {
		return {
			canvasStartX: null,
			canvasStartY: null
		};
	},
	methods: {
		fitDrawing: function() {
			this.$app.$emit('fitDrawingInViewport');
		},
		dragstart: function() {
			this.canvasStartX = this.$store.state.editor.canvasOffset.x;
			this.canvasStartY =	this.$store.state.editor.canvasOffset.y;
		},
		dragupdate: function(e) {
			this.$store.commit('reposition',{
				canvasOffsetX: this.canvasStartX + e.dx,
				canvasOffsetY: this.canvasStartY + e.dy
			});
		},
		wheel: function(e) {

			e.preventDefault();

			var scaleFactor = 1 + e.deltaY / ( e.deltaMode == 0 ? 150 : 3000 );

			// location of the cursor, in user coordinates
			var cursorUser = this.$app.mouseEventToUser(e);
			// apply the scale
			cursorUser.x *= scaleFactor;
			cursorUser.y *= scaleFactor;
			// change back to page coords
			var newCursorPage = this.$app.userToPage(cursorUser);

			// in order to keep the drawing in the same place at the cursor, adjust the canvas offset by the difference in cursor location
			this.$store.commit('reposition',{
				scale: this.$store.state.editor.scale * scaleFactor,
				canvasOffsetX: this.$store.state.editor.canvasOffset.x + e.pageX - newCursorPage.x,
				canvasOffsetY: this.$store.state.editor.canvasOffset.y + e.pageY - newCursorPage.y,
			});

		}
	},
	mounted: function() {
		this.$app.$on('editorDragstart', this.dragstart);
		this.$app.$on('editorDragupdate', this.dragupdate);
		this.$app.$on('editorWheel', this.wheel);
	},
	destroyed: function() {
		this.$app.$off('editorDragstart', this.dragstart);
		this.$app.$off('editorDragupdate', this.dragupdate);
		this.$app.$off('editorWheel', this.wheel);
	}
}

</script>

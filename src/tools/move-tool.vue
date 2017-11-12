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
			if ( this.selectedPoints.length ) {
				this.clickStart = this.$app.mouseEventToUser(e);
				this.pointsStart = this.selectedPoints.map( pointAddr => {
					var point = this.$store.state.drawing.points[pointAddr];
					return {x: point.x, y: point.y};
				} );
			}
		},
		dragupdate: function(e) {
			if ( this.selectedPoints.length ) {
				var clickPoint = this.$app.mouseEventToUser(e);
				var updates = this.selectedPoints.map( (pointAddr,i) => {
					return {
						addr: pointAddr,
						x: this.pointsStart[i].x + clickPoint.x - this.clickStart.x,
						y: this.pointsStart[i].y + clickPoint.y - this.clickStart.y
					};
				} );
				this.$store.commit('updatePoints', {updates: updates});
			}
		}
	},
	mounted: function() {
		this.$app.$on('editorDragstart', this.dragstart);
		this.$app.$on('editorDragupdate', this.dragupdate);
	},
	destroyed: function() {
		this.$app.$off('editorDragstart', this.dragstart);
		this.$app.$off('editorDragupdate', this.dragupdate);
	}
};

</script>

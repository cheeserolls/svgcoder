<template>
	<div>
		<h3>Select Tool</h3>
		<!--<selected-path-info v-if="singleSelectedPath" :path="singleSelectedPath" />-->
		<!--<selected-segment-info v-if="singleSelectedSegment" :segment="singleSelectedSegment" />-->
		<!--<selected-point-info v-if="selectedPoints.length" />-->
	</div>
</template>

<script>
import _ from 'lodash';
//import SelectedPathInfo from '../components/selected-path-info.vue';
//import SelectedSegmentInfo from '../components/SelectedSegmentInfo.vue';
//import SelectedPointInfo from '../components/selected-point-info.vue';

var marquee;

export default {
	name: 'select-tool',
	//components: {SelectedPathInfo,SelectedPointInfo},
	computed: {
		singleSelectedPath: function() {
			if ( this.$store.state.selection.selectedPaths.length == 1 ) {
				return this.$store.state.editor.selectedPaths[0];
			} else {
				return false;
			}
		},
		singleSelectedSegment: function() {
			if ( this.$store.getters.selectedSegments.length == 1 ) {
				return this.$store.state.editor.selectedSegments[0];
			} else {
				return false;
			}
		},
		selectedPoints: function() {
			return this.$store.state.editor.selectedPoints;
		},
	},
	methods: {
		click: function(e) {
			console.log('select click on',e.target);
			if ( e.target instanceof SVGPathElement ) {

				var pathAddr = e.target.getAttribute('data-addr');
				var selected = _.includes(this.$store.state.editor.selectedPaths, pathAddr);

				if (e.shiftKey) {
					if ( selected ) {
						this.$store.commit('updateSelectedPaths', {action:'remove', paths:[pathAddr]});
					} else {
						this.$store.commit('updateSelectedPaths', {action:'add', paths:[pathAddr]});
					}
				} else {
					this.$store.commit('updateSelectedPaths', {action:'replace', paths:[pathAddr]});
				}

			} else if ( e.target.classList.contains('point-marker') ) {

				this.$hub.emit('selectMarker',{el:e.target});

				var pointAddr = e.target.getAttribute('data-addr');
				var selected = _.includes(this.$store.state.editor.selectedPoints, pointAddr);

				if (e.shiftKey) {
					if ( selected ) {
						this.$store.commit('updateSelectedPoints', {action:'remove', points:[pointAddr]});
					} else {
						this.$store.commit('updateSelectedPoints', {action:'add', points:[pointAddr]});
					}
				} else {
					this.$store.commit('updateSelectedPoints', {action:'replace', points:[pointAddr]});
				}

			} else {
				this.$store.commit('deselect');
			}
		},
		dragstart: function(e) {

			this.pageDragStart = {x: e.pageX, y: e.pageY};
			this.userDragStart = this.$app.mouseEventToUser(e);
			marquee.style.display = 'block';
			marquee.style.left = e.pageX + 'px';
			marquee.style.top = e.pageY + 'px';
			marquee.style.width = '0px';
			marquee.style.height = '0px';
		},
		dragupdate: function(e) {
			marquee.style.left = Math.min(e.pageX, this.pageDragStart.x) + 'px';
			marquee.style.top = Math.min(e.pageY, this.pageDragStart.y) + 'px';
			marquee.style.width = Math.abs(e.pageX - this.pageDragStart.x) + 'px';
			marquee.style.height = Math.abs(e.pageY - this.pageDragStart.y) + 'px';
		},
		dragend: function(e) {

			this.userDragEnd = this.$app.mouseEventToUser(e);
			var xMin = Math.min(this.userDragEnd.x, this.userDragStart.x);
			var yMin = Math.min(this.userDragEnd.y, this.userDragStart.y);
			var xMax = Math.max(this.userDragEnd.x, this.userDragStart.x);
			var yMax = Math.max(this.userDragEnd.y, this.userDragStart.y);

			var points = [];
			for (var pointAddr of this.markedPoints) {
				var point = this.$store.state.drawing.points[pointAddr];
				if (point.x > xMin && point.y > yMin && point.x < xMax && point.y < yMax) {
					points.push(pointAddr);
				}
			}
			if (e.shiftKey) {
				this.$store.commit('updateSelectedPoints',{action:'add',points: points});
			} else {
				this.$store.commit('updateSelectedPoints', {action:'replace', points: points});
			}
			marquee.style.display = 'none';
		}
	},
	mounted: function() {
		this.$app.$on('editorClick', this.click);
		this.$app.$on('editorDragstart', this.dragstart);
		this.$app.$on('editorDragupdate', this.dragupdate);
		this.$app.$on('editorDragend', this.dragend);
		marquee = document.createElement('div');
		marquee.className = 'marquee';
		marquee.style.display = 'none';
		document.body.appendChild(marquee);
	},
	destroyed: function() {
		this.$app.$off('editorClick', this.click);
		this.$app.$off('editorDragstart', this.dragstart);
		this.$app.$off('editorDragupdate', this.dragupdate);
		this.$app.$off('editorDragend', this.dragend);
		document.body.removeChild(marquee);
	}
};

</script>

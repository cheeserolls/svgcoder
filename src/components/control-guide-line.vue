<template>
	<path class="guide-line" :d="d" />
</template>

<script>
export default {
	props: ['start','end'],
	computed: {
		viewportStart: function() {
			return this.$app.userToViewport(this.start);
		},
		viewportEnd: function() {
			return this.$app.userToViewport(this.end);
		},
		d: function() {
			return ['M', this.viewportStart.x, this.viewportStart.y, 'L', this.viewportEnd.x, this.viewportEnd.y].join(' ');
		}
	}
}
</script>

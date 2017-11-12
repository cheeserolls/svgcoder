<template>
	<path :d="d" :style="ele.style" :class="ele.class" :data-addr="addr" />
</template>

<script>
export default {
	props: ['addr','ele'],
	computed: {
		d: function() {
			var currentX = 0;
			var currentY = 0;
			var d = '';
			for (var subpathAddr of this.ele.subpaths) {

				var subpath = this.$store.state.drawing.subpaths[subpathAddr];
				var start = this.$store.state.drawing.points[subpath.start];
				if (subpath.relative) {
					d += 'M ' + (start.x - currentX) + ' ' + (start.y - currentY) + ' ';
				} else {
					d += 'M ' + start.x + ' ' + start.y + ' ';
				}
				currentX = start.x;
				currentY = start.y;

				for (var segmentAddr of subpath.segments) {
					var segment = this.$store.state.drawing.segments[segmentAddr];
					var lcType = segment.type.toLowerCase();
					var relative = (lcType == segment.type);
					var values = [];

					switch (lcType) {

						case 'l': case 'c': case 's': case 'q': case 't':
							if (segment.c0) {
								var c0 = this.$store.state.drawing.points[segment.c0];
								values.push( c0.x - ( relative ? currentX : 0 ) );
								values.push( c0.y - ( relative ? currentY : 0 ) );
							}
							if (segment.c1) {
								var c1 = this.$store.state.drawing.points[segment.c1];
								values.push( c1.x - ( relative ? currentX : 0 ) );
								values.push( c1.y - ( relative ? currentY : 0 ) );
							}
							var end = this.$store.state.drawing.points[segment.end];
							values.push( end.x - ( relative ? currentX : 0 ) );
							values.push( end.y - ( relative ? currentY : 0 ) );
							currentX = end.x;
							currentY = end.y;
							break;

						case 'h':
							values.push( segment.endX - ( relative ? currentX : 0 ) );
							currentX = segment.endX;
							break;

						case 'v':
							values.push( segment.endY - ( relative ? currentY : 0 ) );
							currentY = segment.endY;
							break;

						case 'a':
							values.push( segment.radiusX );
							values.push( segment.radiusY );
							values.push( segment.rot );
							values.push( segment.arc );
							values.push( segment.sweep );
							var end = this.$store.state.drawing.points[segment.end];
							values.push( end.x - ( relative ? currentX : 0 ) );
							values.push( end.y - ( relative ? currentY : 0 ) );
							currentX = end.x;
							currentY = end.y;
							break;

						case 'z':
							currentX = start.x;
							currentY = start.y;
							break;
					}

					d += segment.type + ' ' + values.join(' ') + ' ';

				}
			}
			return d;
		}
	}
};
</script>

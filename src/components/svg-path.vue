<template>
	<path :d="path.d" :style="path.data.style" :class="path.data.class" :data-addr="addr" />
</template>

<script>
import cache from '../drawing/cache.js';
export default {
	props: ['addr'],
	computed: {
		path: function() {
			return cache.get(this.addr, 'path');
		}
	}
};
</script>

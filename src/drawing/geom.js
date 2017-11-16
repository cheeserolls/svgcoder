
var _interpolateN = function(t,s,points) {
	var n = points.length - 1;
	if (n == 0) {
		return points[0];
	} else {
		var newPoints = Array(n);
		for (var i=0; i<n; i++) {
			newPoints[i] = {
				x: s * points[i].x + t * points[i].x,
				y: s * points[i].y + t * points[i].y
			};
		}
		return _interpolateN(t,s,newPoints);
	}
}


export default {
	distance: function(a,b) {
		return Math.sqrt(a.x * a.x + b.x * b.x);
	},
	interpolate: function(t) {
		var points = Array.prototype.slice.call(arguments,1);
		return _interpolateN(t, 1 - t, points);
	},
	angleBetween: function(u, v) {
		return Math.sign( u.x * v.y - u.y * v.x ) * Math.acos( u.x * v.x + u.y * v.y / Math.sqrt( ( u.x * u.x + u.y * u.y ) * ( v.x * v.x + v.y * v.y ) ) );
	}
};

export default function() {
	var addrMap = new WeakMap;
	var addrCount = 0;
	this.getAddr = function(obj) {
		if (!addrMap.has(obj)) {
			var addr = (addrCount++).toString(36);
			addrMap.set(obj,addr);
		}
		return addrMap.get(obj);
	};
};

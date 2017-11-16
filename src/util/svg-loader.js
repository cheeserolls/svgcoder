import PathParser from './path-parser.js';

var SvgLoader = function(addresser) {
	this.addresser = addresser;
}

SvgLoader.prototype.readElementAttributes = function(eleData, ele) {
	for (var attribute of ele.attributes) {
		switch (attribute.name) {
			case 'viewbox':
				// viewbox of root SVG element is handled by extractDataFromSvgElement(), so ignore it here
				break;
			case 'id':
				eleData.id = attribute.value;
				break;
			case 'class':
				eleData.class = attribute.value;
				break;
			case 'style':
				eleData.style = {};
				for (var i=0; i<ele.style.length; i++) {
					eleData.style[ele.style[i]] = ele.style.getPropertyValue(ele.style[i]);
				}
				break;
			case 'd':
				// path data
				this.readPathData(eleData, attribute.value);
				break;
			default:
				if (attribute.specified) {
					if (!eleData.other) {eleData.other = {};}
					eleData.other[attribute.name] = attribute.value;
				}
				break;
		}
	}
};

SvgLoader.prototype.readNode = function(node, parentAddr) {

	var nodeData = {parent: parentAddr};
	var nodeAddr = this.addresser.getAddr(nodeData);
	this.data.nodes[nodeAddr] = nodeData;

	if (node.nodeType == 1) {
		nodeData.nodeName = node.tagName;
		this.readElementAttributes(nodeData, node);
	} else {
		nodeData.nodeName = node.nodeName;
		nodeData.value = node.nodeValue;
	}

	nodeData.children = [];
	for (var i=0; i<node.childNodes.length; i++) {
		nodeData.children[i] = this.readNode(node.childNodes[i], nodeAddr);
	}

	return nodeAddr;
};

SvgLoader.prototype.readPathData = function(eleData, pathString) {

	var pointNames = ['c0','c1','end'];
	eleData.subpaths = [];
	var parser = new PathParser();
	var subpaths = parser.parse(pathString);

	for (var i=0; i<subpaths.length; i++) {

		var subpathData = _.assign(subpaths[i], {nodeName: 'subpath', parent: this.addresser.getAddr(eleData)});
		var subpathAddr = this.addresser.getAddr(subpathData);
		this.data.nodes[subpathAddr] = subpathData;
		eleData.subpaths.push(subpathAddr);

		var startData = _.assign(subpathData.start, {nodeName: 'point', parent: subpathAddr});
		var startAddr = this.addresser.getAddr(startData);
		this.data.nodes[startAddr] = startData;
		subpathData.start = startAddr; // replace data with address

		for (var j=0; j<subpathData.segments.length; j++) {

			var segmentData = _.assign(subpathData.segments[j], {nodeName: 'segment', parent: subpathAddr});
			var segmentAddr = this.addresser.getAddr(segmentData);
			this.data.nodes[segmentAddr] = segmentData;
			subpathData.segments[j] = segmentAddr; // replace data with address

			for (var pointName of pointNames) {
				if (segmentData[pointName]) {
					var pointData = _.assign(segmentData[pointName],{nodeName: 'point', parent: segmentAddr});
					var pointAddr = this.addresser.getAddr(pointData);
					this.data.nodes[pointAddr] = pointData;
					segmentData[pointName] = pointAddr; // replace data with address
				}
			}
		}
	}

};

SvgLoader.prototype.extractDataFromSvgElement = function(svgRootEle) {

	this.data = {};

	this.data.nodes = {};

	this.data.viewbox = {
		x: svgRootEle.viewBox.baseVal.x,
		y: svgRootEle.viewBox.baseVal.y,
		width: svgRootEle.viewBox.baseVal.width,
		height: svgRootEle.viewBox.baseVal.height
	};

	this.data.rootNode = this.readNode(svgRootEle, null);

	return this.data;

};

SvgLoader.prototype.extractDataFromSvgString = function(svgString) {

	var tempDoc = document.implementation.createHTMLDocument();
	var tempDiv = tempDoc.createElement('div');
	tempDiv.innerHTML = svgString;
	var svg = tempDiv.getElementsByTagName('svg')[0];
	if (!svg) {
		throw new Error("No SVG data found in string");
	}
	return this.extractDataFromSvgElement(svg);

};

export default SvgLoader;

import PathParser from './path-parser.js';

var SvgLoader = function(addresser) {
	this.addresser = addresser;
}

SvgLoader.prototype.readElementAttributes = function(eleData, ele) {
	for (var attribute of ele.attributes) {
		switch (attribute.name) {
			case 'viewbox':
				break;
			case 'id':
				eleData.id = attribute.value;
				break;
			case 'class':
				eleData.class = attribute.value;
				break;
			case 'style':
				// what to do here then?
				eleData.style = {};
				for (var i=0; i<ele.style.length; i++) {
					eleData.style[ele.style[i]] = ele.style.getPropertyValue(ele.style[i]);
				}
				break;
			case 'd':
				// path data
				this.readPathData(eleData, attribute.value, ele);
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

SvgLoader.prototype.readNode = function(node) {

	var nodeData = {};
	var nodeAddr = this.addresser.getAddr(node);
	this.data.nodes[nodeAddr] = nodeData;

	if (node.nodeType == 1) {
		nodeData.type = node.tagName;
		this.readElementAttributes(nodeData, node);
	} else {
		nodeData.type = node.nodeName;
		nodeData.value = node.nodeValue;
	}

	nodeData.children = [];
	for (var i=0; i<node.childNodes.length; i++) {
		nodeData.children[i] = this.readNode(node.childNodes[i]);
	}

	return nodeAddr;
};

SvgLoader.prototype.readPathData = function(eleData, pathString, ele) {

	var pointNames = ['c0','c1','end'];
	eleData.subpaths = [];
	var parser = new PathParser();
	var subpaths = parser.parse(pathString);

	for (var i=0; i<subpaths.length; i++) {
		var subpath = subpaths[i];
		subpath.parent = this.addresser.getAddr(ele);
		var subpathAddr = this.addresser.getAddr(subpath);
		this.data.subpaths[subpathAddr] = subpath;
		eleData.subpaths.push(subpathAddr);
		var start = subpath.start;
		start.parent = subpathAddr;
		var startAddr = this.addresser.getAddr(start);
		this.data.points[startAddr] = start;
		subpath.start = startAddr;
		for (var j=0; j<subpath.segments.length; j++) {
			var segment = subpath.segments[j];
			segment.parent = subpathAddr;
			var segmentAddr = this.addresser.getAddr(segment);
			this.data.segments[segmentAddr] = segment;
			subpath.segments[j] = segmentAddr;
			for (var pointName of pointNames) {
				if (segment[pointName]) {
					var point = segment[pointName];
					point.parent = segmentAddr;
					var pointAddr = this.addresser.getAddr(point);
					this.data.points[pointAddr] = point;
					segment[pointName] = pointAddr;
				}
			}
		}
	}

};

SvgLoader.prototype.extractDataFromSvgElement = function(svgRootEle) {

	this.data = {
		nodes: {},
		subpaths: {},
		segments: {},
		points: {},
	};

	this.data.viewbox = {
		x: svgRootEle.viewBox.baseVal.x,
		y: svgRootEle.viewBox.baseVal.y,
		width: svgRootEle.viewBox.baseVal.width,
		height: svgRootEle.viewBox.baseVal.height
	};

	this.data.rootNode = this.readNode(svgRootEle);

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


var commandsMap = {
	"Z":"Z", "M":"M", "L":"L", "C":"C", "Q":"Q", "A":"A", "H":"H", "V":"V", "S":"S", "T":"T",
	"z":"Z", "m":"m", "l":"l", "c":"c", "q":"q", "a":"a", "h":"h", "v":"v", "s":"s", "t":"t"
};

var PathParser = function(dataString) {};

PathParser.prototype.parse = function(dataString) {

	this.subpaths = [];
	this.currentSubPath = null;
	this.currentX = 0;
	this.currentY = 0;
	this._string = dataString;
	this._currentIndex = 0;
	this._endIndex = this._string.length;
	this._prevCommand = null;

	this._skipOptionalSpaces();
	if (this.initialCommandIsMoveTo()) {
		while (this.hasMoreData() && this.parseSegment()) {
			;
		}
	}

	return this.subpaths;

};

PathParser.prototype.parseSegment = function() {

	var command = this._parseCommand();
	if (!command) {
		return false;
	}

	var lcCommand = command.toLowerCase();
	var relative = (lcCommand == command);

	switch( lcCommand ) {
		case 'm':
			// Start a new subpath
			this.currentSubPath = {
				relative: relative,
				start: {
					x: (relative ? this.currentX : 0) + this._parseNumber(),
					y: (relative ? this.currentY : 0) + this._parseNumber()
				},
				segments: []
			};
			this.currentX = this.currentSubPath.start.x;
			this.currentY = this.currentSubPath.start.y;
			this.subpaths.push(this.currentSubPath);
			return true;

		case 'z':
			// Close the current subpath
			var segment = {type: command};
			this.currentX = this.currentSubPath.start.x;
			this.currentY = this.currentSubPath.start.y;
			this.currentSubPath.segments.push(segment);
			this.currentSubPath = null;
			this._skipOptionalSpaces();
			return true;

		case 'l': case 'c': case 's': case 'q': case 't':
			// Add a line or curve to the current subpath
			var segment = {type: command, end: {}};
			if ( lcCommand == 'c' || lcCommand == 's' || lcCommand == 'q' ) {
				segment.c0 = {
					x: ( relative ? this.currentX : 0 ) + this._parseNumber(),
					y: ( relative ? this.currentY : 0 ) + this._parseNumber()
				};
			}
			if ( lcCommand == 'c' ) {
				segment.c1 = {
					x: ( relative ? this.currentX : 0 ) + this._parseNumber(),
					y: ( relative ? this.currentY : 0 ) + this._parseNumber()
				};
			}
			segment.end.x = this.currentX = ( relative ? this.currentX : 0 ) + this._parseNumber();
			segment.end.y = this.currentY = ( relative ? this.currentY : 0 ) + this._parseNumber();
			this.currentSubPath.segments.push(segment);
			return true;

		case 'h':
			// Add a horizontal line to the current subpath
			var segment = {type: command};
			segment.endX = this.currentX = ( relative ? this.currentX : 0 ) + this._parseNumber();
			this.currentSubPath.segments.push(segment);
			return true;

		case 'v':
			// Add a vertical line to the current subpath
			var segment = {type: command};
			segment.endY = this.currentY = ( relative ? this.currentY : 0 ) + this._parseNumber();
			this.currentSubPath.segments.push(segment);
			return true;

		case 'a':
			// Add an arc to the current subpath
			var segment = {type: command, end: {}};
			segment.radiusX = this._parseNumber();
			segment.radiusY = this._parseNumber();
			segment.rot = this._parseNumber();
			segment.arc = this._parseArcFlag();
			segment.sweep = this._parseArcFlag();
			segment.end.x = this.currentX = ( relative ? this.currentX : 0 ) + this._parseNumber();
			segment.end.y = this.currentY = ( relative ? this.currentY : 0 ) + this._parseNumber();
			this.currentSubPath.segments.push(segment);
			return true;
	}

};

PathParser.prototype._parseCommand = function() {

	var char = this._string[this._currentIndex];
	var command = commandsMap[char] ? commandsMap[char] : false;

	if (!command) {

		// Possibly an implicit command. Not allowed if this is the first command.
		if (this._prevCommand === null) {
			return false;
		}

		// Check for remaining coordinates in the current command.
		if ((char === "+" || char === "-" || char === "." || (char >= "0" && char <= "9")) && this._prevCommand !== "Z") {
			if (this._prevCommand === "M") {
				command = "L";
			} else if (this._prevCommand === "m") {
				command = "l";
			} else {
				command = this._prevCommand;
			}
		} else {
			return false;
		}
	} else {
		this._currentIndex += 1;
	}

	this._prevCommand = command;
	return command;

};

PathParser.prototype.hasMoreData = function() {
	return this._currentIndex < this._endIndex;
};

PathParser.prototype.peekSegmentType = function() {
	var char = this._string[this._currentIndex];
	return commandsMap[char] ? commandsMap[char] : null;
};

PathParser.prototype.initialCommandIsMoveTo = function() {
	// If the path is empty it is still valid, so return true.
	if (!this.hasMoreData()) {
		return true;
	}

	var command = this.peekSegmentType();
	// Path must start with moveTo.
	return command === "M" || command === "m";
};

PathParser.prototype._isCurrentSpace = function() {
	var char = this._string[this._currentIndex];
	return char <= " " && (char === " " || char === "\n" || char === "\t" || char === "\r" || char === "\f");
};

PathParser.prototype._skipOptionalSpaces = function() {
	while (this._currentIndex < this._endIndex && this._isCurrentSpace()) {
		this._currentIndex += 1;
	}

	return this._currentIndex < this._endIndex;
};

PathParser.prototype._skipOptionalSpacesOrDelimiter = function() {
	if (
		this._currentIndex < this._endIndex &&
		!this._isCurrentSpace() &&
		this._string[this._currentIndex] !== ","
	) {
		return false;
	}

	if (this._skipOptionalSpaces()) {
		if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ",") {
			this._currentIndex += 1;
			this._skipOptionalSpaces();
		}
	}
	return this._currentIndex < this._endIndex;
};

// Parse a number from an SVG path.
PathParser.prototype._parseNumber = function() {

	var exponent = 0;
	var integer = 0;
	var frac = 1;
	var decimal = 0;
	var sign = 1;
	var expsign = 1;
	var startIndex = this._currentIndex;

	this._skipOptionalSpaces();

	// Read the sign.
	if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === "+") {
		this._currentIndex += 1;
	} else if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === "-") {
		this._currentIndex += 1;
		sign = -1;
	}

	if (
		this._currentIndex === this._endIndex ||
		(
			(this._string[this._currentIndex] < "0" || this._string[this._currentIndex] > "9") &&
			this._string[this._currentIndex] !== "."
		)
	) {
		// The first character of a number must be one of [0-9+-.].
		return null;
	}

	// Read the integer part, build right-to-left.
	var startIntPartIndex = this._currentIndex;

	while (
		this._currentIndex < this._endIndex &&
		this._string[this._currentIndex] >= "0" &&
		this._string[this._currentIndex] <= "9"
	) {
		this._currentIndex += 1; // Advance to first non-digit.
	}

	if (this._currentIndex !== startIntPartIndex) {
		var scanIntPartIndex = this._currentIndex - 1;
		var multiplier = 1;

		while (scanIntPartIndex >= startIntPartIndex) {
			integer += multiplier * (this._string[scanIntPartIndex] - "0");
			scanIntPartIndex -= 1;
			multiplier *= 10;
		}
	}

	// Read the decimals.
	if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ".") {
		this._currentIndex += 1;

		// There must be a least one digit following the .
		if (
			this._currentIndex >= this._endIndex ||
			this._string[this._currentIndex] < "0" ||
			this._string[this._currentIndex] > "9"
		) {
			return null;
		}

		while (
			this._currentIndex < this._endIndex &&
			this._string[this._currentIndex] >= "0" &&
			this._string[this._currentIndex] <= "9"
		) {
			frac *= 10;
			decimal += (this._string.charAt(this._currentIndex) - "0") / frac;
			this._currentIndex += 1;
		}
	}

	// Read the exponent part.
	if (
		this._currentIndex !== startIndex &&
		this._currentIndex + 1 < this._endIndex &&
		(this._string[this._currentIndex] === "e" || this._string[this._currentIndex] === "E") &&
		(this._string[this._currentIndex + 1] !== "x" && this._string[this._currentIndex + 1] !== "m")
	) {
		this._currentIndex += 1;

		// Read the sign of the exponent.
		if (this._string[this._currentIndex] === "+") {
			this._currentIndex += 1;
		}
		else if (this._string[this._currentIndex] === "-") {
			this._currentIndex += 1;
			expsign = -1;
		}

		// There must be an exponent.
		if (
			this._currentIndex >= this._endIndex ||
			this._string[this._currentIndex] < "0" ||
			this._string[this._currentIndex] > "9"
		) {
			return null;
		}

		while (
			this._currentIndex < this._endIndex &&
			this._string[this._currentIndex] >= "0" &&
			this._string[this._currentIndex] <= "9"
		) {
			exponent *= 10;
			exponent += (this._string[this._currentIndex] - "0");
			this._currentIndex += 1;
		}
	}

	var number = integer + decimal;
	number *= sign;

	if (exponent) {
		number *= Math.pow(10, expsign * exponent);
	}

	if (startIndex === this._currentIndex) {
		return null;
	}

	this._skipOptionalSpacesOrDelimiter();

	return number;
};

PathParser.prototype._parseArcFlag = function() {
	if (this._currentIndex >= this._endIndex) {
		return null;
	}

	var flag = null;
	var flagChar = this._string[this._currentIndex];

	this._currentIndex += 1;

	if (flagChar === "0") {
		flag = 0;
	} else if (flagChar === "1") {
		flag = 1;
	} else {
		return null;
	}

	this._skipOptionalSpacesOrDelimiter();
	return flag;
};

export default PathParser;

class PathRegExp {
	static escape(string:string):string {
		return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	}

	/**
	 * The JavaScript-compatible regular expression to match the path.
	 *
	 * @type {RegExp}
	 */
	protected _expression:RegExp;

	/**
	 * A map of parameter key position to parameter key name, to translate match indexes from the JavaScript RegExp
	 * object into named properties.
	 *
	 * @type {string[]}
	 */
	protected _keys:string[];

	/**
	 * The list of all parts that constitute a complete parameterized expression. Used to generate strings that will
	 * match the parameterized expression (reverse routing).
	 *
	 * @type {any[]}
	 */
	protected _parts:any[];

	constructor(
		path:string,
		partSeparator?:string,
		separatorDirection:PathRegExp.Direction = PathRegExp.Direction.LEFT,
		isCaseSensitive:boolean = true,
		defaults:{} = {}
	) {
		function checkForSeparatorAt(index:number, length:number):boolean {
			// This parameter is at the start of the path, so cannot have a leading separator
			if (separatorDirection === PathRegExp.Direction.LEFT && index < partSeparator.length) {
				return false;
			}

			// This parameter is at the end of the path, so cannot have a trailing separator
			if (separatorDirection === PathRegExp.Direction.RIGHT && index + partSeparator.length > path.length) {
				return false;
			}

			var separatorIndex = index;

			if (separatorDirection === PathRegExp.Direction.LEFT) {
				separatorIndex -= partSeparator.length;
			}
			else {
				separatorIndex += length;
			}

			return path.slice(separatorIndex, separatorIndex + partSeparator.length) === partSeparator;
		}

		/**
		 * Converts regular expression capturing groups in an expression string to non-capturing groups.
		 */
		function convertCaptureGroups(expression:string):string {
			var lastIndex:number;
			var index:number;
			var nonCapturingGroups:HashMap<boolean> = {
				'?:': true,
				'?=': true,
				'?!': true
			};

			while ((index = expression.indexOf('(', lastIndex)) > -1) {
				lastIndex = index;

				var numEscapeChars = 0;
				while (expression.charAt(index - 1) === '\\') {
					++numEscapeChars;
					--index;
				}

				if (
					// The bracket is part of a group
					(numEscapeChars % 2) === 0 &&
					// The group is not a look-ahead or non-capturing group
					!nonCapturingGroups[expression.slice(lastIndex + 1, lastIndex + 3)]
				) {
					expression = expression.slice(0, lastIndex + 1) + '?:' + expression.slice(lastIndex + 1);
				}

				++lastIndex;
			}

			return expression;
		}

		var parameterPattern:RegExp = /<([^:]+):([^>]+)>/g;

		var expression:string = '^';
		var keys:string[] = [];
		var parts:any[] = [];

		var lastIndex:number = 0;
		var match:RegExpExecArray;
		var partIsOptional:boolean;
		var regExpFlags:string = isCaseSensitive ? '' : 'i';
		var staticPart:string;
		var valueExpression:string;

		while ((match = parameterPattern.exec(path))) {
			keys.push(match[1]);
			valueExpression = '(' + convertCaptureGroups(match[2]) + ')';

			staticPart = path.slice(lastIndex, match.index);
			parts.push(staticPart);

			// Parameters with default values do not need to be matched in order for the expression to be a match, since
			// the default values can be used for missing parameters
			if (partSeparator && match[1] in defaults && checkForSeparatorAt(match.index, match[0].length)) {
				if (separatorDirection === PathRegExp.Direction.LEFT) {
					expression += PathRegExp.escape(staticPart.slice(0, -partSeparator.length));
					expression += '(?:' + PathRegExp.escape(partSeparator) + valueExpression + ')?';
				}
				else {
					expression += PathRegExp.escape(staticPart);
					expression += '(?:' + valueExpression + PathRegExp.escape(partSeparator) + ')?';
				}

				partIsOptional = true;
			}
			else {
				expression += PathRegExp.escape(staticPart) + valueExpression;
				partIsOptional = false;
			}

			parts.push({ key: match[1], expression: new RegExp(match[2], regExpFlags), isOptional: partIsOptional });

			lastIndex = match.index + match[0].length;

			// The part separator was introduced to the expression above, so we need to add it right away as a static
			// part and then exclude it from the next pass to avoid it showing up twice in the expression
			if (PathRegExp.Direction.RIGHT && partIsOptional) {
				parts.push(path.slice(lastIndex, lastIndex + partSeparator.length));
				lastIndex += partSeparator.length;
			}
		}

		staticPart = path.slice(lastIndex);
		parts.push(staticPart);
		expression += PathRegExp.escape(staticPart) + '$';

		this._expression = new RegExp(expression, regExpFlags);
		this._keys = keys;
		this._parts = parts;
	}

	/**
	 * Generates a path matching this URL rule, containing the given arguments. Properties of kwArgs are consumed
	 * by this operation and will no longer exist on the kwArgs object after processing.
	 *
	 * @param kwArgs
	 * @returns {string} [description]
	 */
	consume(kwArgs:{}):string {
		var serialization:string = '';

		var key:string;
		for (var i:number = 0, j:number = this._parts.length; i < j; ++i) {
			var part:any = this._parts[i];

			if (typeof part === 'string') {
				serialization += part;
			}
			else {
				key = part.key;

				if (!(key in kwArgs)) {
					if (!part.isOptional) {
						throw new Error('Missing required key "' + key + '"');
					}
					else {
						continue;
					}
				}

				var value:any = (<any> kwArgs)[key];
				var expression:RegExp = part.expression;

				if (value instanceof Array) {
					value = value.shift();
				}

				if (!expression.test(value)) {
					throw new Error('Key "' + key + '" does not match expected pattern ' + expression);
				}

				serialization += value;

				if (!((<any> kwArgs)[key] instanceof Array) || (<any> kwArgs)[key].length === 0) {
					delete (<any> kwArgs)[key];
				}
			}
		}

		return serialization;
	}

	/**
	 * Executes a search for a match against the given string.
	 *
	 * @param value A string to match.
	 * @returns A hash map of parameters extracted from the string.
	 */
	exec(string:string, options:{ coerce?:boolean; } = {}):HashMap<string> {
		var key:string;
		var match:RegExpExecArray;

		if ((match = this._expression.exec(string))) {
			var kwArgs:HashMap<any> = {};

			for (var i = 0, j = this._keys.length; i < j; ++i) {
				key = this._keys[i];

				var value:any = match[i + 1];

				// Optional matches that did not match should not be added to the map of extracted parameters
				if (value === undefined) {
					continue;
				}

				if (options.coerce !== false && !isNaN(value)) {
					value = Number(value);
				}

				// Multiple parameters with the same name should not clobber earlier parameters
				if (key in kwArgs) {
					if (!(kwArgs[key] instanceof Array)) {
						kwArgs[key] = [ kwArgs[key] ];
					}

					kwArgs[key].push(value);
				}
				else {
					kwArgs[key] = value;
				}
			}

			return kwArgs;
		}

		return null;
	}

	/**
	 * Tests whether or not the given string matches this path expression.
	 */
	test(value:string):boolean {
		return this._expression.test(value);
	}

	/**
	 * Tests whether or not the given arguments can be successfully consumed by this path expression and converted into
	 * a path string.
	 */
	testConsumability(kwArgs:{}):boolean {
		for (var i = 0, j = this._parts.length; i < j; ++i) {
			var part:any = this._parts[i];

			if (typeof part !== 'string') {
				var key:string = part.key;

				if (!(key in kwArgs) && !part.isOptional) {
					return false;
				}

				if (!part.expression.test((<any> kwArgs)[key])) {
					return false;
				}
			}
		}

		return true;
	}
}

module PathRegExp {
	export enum Direction {
		LEFT,
		RIGHT
	}

	export interface Part {
		key:string;
		expression:RegExp;
		isOptional:boolean;
	}
}

export = PathRegExp;

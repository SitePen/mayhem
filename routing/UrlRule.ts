/// <reference path="../dojo" />

import arrayUtil = require('dojo/_base/array');
import ioQuery = require('dojo/io-query');
import Observable = require('../Observable');
import Request = require('./Request');
import Router = require('./Router');

function mixWithClonedArrays(target:{}, ...sources:{}[]):{} {
	for (var i = 0, j = sources.length; i < j; ++i) {
		var source:HashMap<any> = <any> sources[i];
		for (var key in source) {
			(<any> target)[key] = source[key] instanceof Array ? source[key].slice(0) : source[key];
		}
	}

	return target;
}

function mixWithArrayConversion(target:{}, ...sources:{}[]):{} {
	var targetMap:HashMap<any> = <any> target;

	for (var i = 0, j = sources.length; i < j; ++i) {
		var source:HashMap<any> = <any> sources[i];
		for (var key in source) {
			var value = source[key];

			if (key in targetMap) {
				if (!(targetMap[key] instanceof Array)) {
					targetMap[key] = [ targetMap[key] ];
				}

				targetMap[key].push(value);
			}
			else {
				targetMap[key] = value;
			}
		}
	}

	return targetMap;
}

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

class UrlRule extends Observable {
	get:UrlRule.Getters;
	set:UrlRule.Setters;

	protected _hostExpression:PathRegExp;
	protected _pathExpression:PathRegExp;

	private _defaults:{ routeId?:string; };
	_defaultsGetter() {
		return this._defaults;
	}
	_defaultsSetter(value:{}) {
		this._defaults = value;
		this._hostSetter(this._host);
		this._pathSetter(this._path);
	}

	private _host:string;
	_hostGetter() {
		return this._host;
	}
	_hostSetter(value:string) {
		this._host = value;
		this._hostExpression = value
			? this._parsePattern(value, '.', PathRegExp.Direction.RIGHT, this.get('isCaseSensitive'), this.get('defaults'))
			: null;
	}

	private _isCaseSensitive:boolean;
	_isCaseSensitiveGetter() {
		return this._isCaseSensitive;
	}
	_isCaseSensitiveSetter(value:boolean) {
		this._isCaseSensitive = value;
		this._hostSetter(this._host);
		this._pathSetter(this._path);
	}

	private _path:string;
	_pathGetter() {
		return this._path;
	}
	_pathSetter(value:string) {
		this._path = value;
		this._pathExpression = value
			? this._parsePattern(value, '/', PathRegExp.Direction.LEFT, this.get('isCaseSensitive'), this.get('defaults'))
			: null;
	}

	_initialize() {
		super._initialize();
		this.set('mode', UrlRule.Mode.PARSE | UrlRule.Mode.SERIALIZE);
	}

	protected _parsePattern(pattern:string, separator?:string, separatorDirection?:PathRegExp.Direction, isCaseSensitive?:boolean, defaults?:{}) {
		return new PathRegExp(pattern, separator, separatorDirection, isCaseSensitive, defaults);
	}

	parse(request:Request):Router.RouteInfo {
		if (!(this.get('mode') & UrlRule.Mode.PARSE)) {
			return null;
		}

		if (this.get('protocol') && request.protocol !== this.get('protocol')) {
			return null;
		}

		if (this.get('methods') && arrayUtil.indexOf(this.get('methods'), request.method) === -1) {
			return null;
		}

		if (this._hostExpression && !this._hostExpression.test(request.host)) {
			return null;
		}

		var path = request.path && request.path.replace(/^\/*|\/*$/g, '');

		if (this._pathExpression && !this._pathExpression.test(path)) {
			return null;
		}

		var kwArgs:any = {};

		if (this._hostExpression) {
			mixWithArrayConversion(kwArgs, this._hostExpression.exec(request.host));
		}

		if (this._pathExpression) {
			mixWithArrayConversion(kwArgs, this._pathExpression.exec(path));
		}

		// if (request.vars.hasKeys)
		/* tslint:disable:no-unused-variable */
		for (var _ in request.vars) {
			mixWithArrayConversion(kwArgs, request.vars);
			break;
		}
		/* tslint:enable:no-unused-variable */

		var defaults:HashMap<any> = <any> this.get('defaults');
		for (var key in defaults) {
			if (!(key in kwArgs)) {
				kwArgs[key] = defaults[key];
			}
		}

		var routeInfo:Router.RouteInfo = {
			routeId: kwArgs.routeId || this.get('routeId'),
			kwArgs: kwArgs
		};

		if (!routeInfo.routeId) {
			return null;
		}

		delete kwArgs.routeId;

		return routeInfo;
	}

	serialize(routeId:string, kwArgs?:{}):string {
		if (!(this.get('mode') & UrlRule.Mode.SERIALIZE)) {
			return null;
		}

		// routeId restricts the use of this rule for serialization to a specific route
		if (this.get('routeId') && this.get('routeId') !== routeId) {
			return null;
		}

		var routeInfo:any;

		// The route ID only needs to be provided for serialization when the rule does not know its own route ID
		if (this.get('routeId')) {
			routeInfo = {};
		}
		else {
			routeInfo = { routeId: routeId };
		}

		mixWithClonedArrays(routeInfo, this.get('defaults'), kwArgs);

		if (this._hostExpression && !this._hostExpression.testConsumability(routeInfo)) {
			return null;
		}

		if (this._pathExpression && !this._pathExpression.testConsumability(routeInfo)) {
			return null;
		}

		var serialization = '';

		if (this.get('protocol')) {
			if (!this._hostExpression) {
				return null;
			}

			serialization += this.get('protocol');
		}

		if (this._hostExpression) {
			serialization += '//' + this._hostExpression.consume(routeInfo) + '/';
		}

		if (this._pathExpression) {
			if (!this._hostExpression) {
				serialization += '/';
			}

			serialization += this._pathExpression.consume(routeInfo);
		}

		// if (routeInfo.hasExtraKeys)
		for (var key in routeInfo) {
			serialization += '?' + ioQuery.objectToQuery(routeInfo);
			break;
		}

		return serialization;
	}
}

module UrlRule {
	export interface Getters extends Observable.Getters {
		(key:'defaults'):{};
		(key:'host'):string;
		(key:'isCaseSensitive'):boolean;
		(key:'path'):string;
		(key:'protocol'):string;
		(key:'methods'):string[];
		(key:'mode'):UrlRule.Mode;
		(key:'routeId'):string;
	}

	export enum Mode {
		PARSE = 1,
		SERIALIZE = 2
	}

	export interface Setters extends Observable.Setters {
		(key:'defaults', value:{}):void;
		(key:'host', value:string):void;
		(key:'isCaseSensitive', value:boolean):void;
		(key:'path', value:string):void;
		(key:'protocol', value:string):void;
		(key:'methods', value:string[]):void;
		(key:'mode', value:UrlRule.Mode):void;
		(key:'routeId', value:string):void;
	}
}

export = UrlRule;

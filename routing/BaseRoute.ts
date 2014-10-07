/// <reference path="../dojo" />

import Observable = require('../Observable');
import ioQuery = require('dojo/io-query');
import lang = require('dojo/_base/lang');

/**
 * A BaseRoute is an object that provides round-trip serialising and parsing of routes based on URL-like path fragments.
 * The BaseRoute class is a base class for different routes that provides functionality for matching, parsing, and
 * serializing paths on a route using a URL-like syntax.
 *
 * @example
 * Basic usage:
 *
 * ```ts
 * var route = new BaseRoute({ path: '<view:foo|bar|baz>/<id:\\d+>' });
 * route.test('foo/1234'); // -> true
 * route.test('foo/'); // -> false (path must match fully)
 * route.test('bar/foo/1234'); // -> false (path must match from the start of the string)
 * route.parse('foo/1234'); // -> { view: 'foo', id: 1234 }
 * route.serialize({ view: 'foo', id: 1234 }); // -> 'foo/1234'
 * route.serialize({ view: 'foo' }); // -> throws error due to insufficient number of arguments
 * route.serialize({ view: 'foo', id: 1234, bar: true }); // -> 'foo/1234?bar=true'
 * ```
 *
 * @example
 * Multiple named capturing groups with the same identifier:
 *
 * ```ts
 * var route = new BaseRoute({ path: '<view:\\w+>/<view:\\w+>' });
 * route.parse('foo/bar'); // -> { view: [ 'foo', 'bar' ] }
 * route.serialize({ view: [ 'foo', 'bar' ] }); // -> 'foo/bar'
 * route.serialize({ view: [ 'foo' ] }); // -> throws error due to insufficient number of arguments
 * ```
 */
class BaseRoute extends Observable {
	/**
	 * @protected
	 * @get
	 * @set
	 */
	_isCaseSensitive:boolean;

	/**
	 * The path that matches this BaseRoute. The path is a string that can contain named capturing groups using the
	 * syntax `<identifier:pattern>`, where the regular expression given in `pattern` will be captured and placed on the
	 * property labelled with `identifier`. Multiple named capturing groups with the same identifier may be used (e.g.
	 * `<view:\w+>/<view:\w+>`), in which case the associated value will be an array.
	 *
	 * Do not use capturing groups (`()`) within regular expression patterns. This will break the BaseRoute.
	 * Non-capturing groups (`(?:)`) may be used if necessary.
	 *
	 * Routes are always matched from the start of the string, so cannot be used to find matches within the middle of a
	 * path.
	 *
	 * Any extra arbitrary arguments that are not explicitly defined as being part of a BaseRoute path are provided
	 * using a standard query-string attached to the end of the path (e.g. `foo/bar?baz=true`).
	 *
	 * @protected
	 * @get
	 * @set
	 */
	_path:string;

	/**
	 * @protected
	 */
	_pathKeys:Array<string>;

	/**
	 * @protected
	 */
	_pathParts:Array<any>;

	/**
	 * @protected
	 */
	_pathPattern:RegExp;

	get:BaseRoute.Getters;
	set:BaseRoute.Setters;

	_isCaseSensitiveSetter(isCaseSensitive:boolean):void {
		var regExpFlags:string = isCaseSensitive ? '' : 'i';

		if (this._pathPattern) {
			this._pathPattern = new RegExp(this._pathPattern.source, regExpFlags);

			for (var i:number = 0, j:number = this._pathParts.length; i < j; ++i) {
				var part:any = this._pathParts[i];

				// These patterns are updated here instead of being generated every time someone calls serialize
				// because calls to serialize are more common
				if (part.pattern) {
					part.pattern = new RegExp(part.pattern.source, regExpFlags);
				}
			}
		}
		this._isCaseSensitive = isCaseSensitive;
	}

	_pathSetter(path:string):void {
		/**
		 * Gets a part of the path string corresponding to the given start and end indexes and escapes it for use within
		 * a regular expression.
		 */
		function getStaticPart(start:number, end?:number):string {
			return path.slice(start, end).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
		}

		var parameterPattern:RegExp = /<([^:]+):([^>]+)>/g;
		var realPathPattern:string = '^';
		var pathKeys:string[] = [];
		var pathParts:any[] = [];
		var lastIndex:number = 0;
		var match:RegExpExecArray;
		var staticPart:string;
		var regExpFlags:string = this._isCaseSensitive ? '' : 'i';

		while ((match = parameterPattern.exec(path))) {
			pathKeys.push(match[1]);

			// static parts must always be string literals, not regular expressions, since it is not possible to
			// generate a reverse path otherwise
			staticPart = getStaticPart(lastIndex, match.index);
			pathParts.push(staticPart, { key: match[1], pattern: new RegExp(match[2], regExpFlags) });

			realPathPattern += staticPart + '(' + match[2] + ')';

			lastIndex = match.index + match[0].length;
		}

		staticPart = getStaticPart(lastIndex);
		realPathPattern += staticPart + '(?:(?:\\?(.*))|\\/.*|$)';
		pathParts.push(staticPart);

		this._pathKeys = pathKeys;
		this._pathParts = pathParts;
		this._pathPattern = new RegExp(realPathPattern, regExpFlags);
		this._path = path;
	}

	/**
	 * Tests whether or not the given path matches this route.
	 */
	test(path:string):boolean {
		return this._pathPattern.test(path);
	}

	/**
	 * Given a path, parse the arguments from the path and return them according to the route's path specification.
	 *
	 * @param path - The path to parse into a hash map.
	 * @param options - Options for generating the returned hash map. The available options are:
	 *   * coerce (boolean, default: true) - Whether or not to coerce numeric arguments to a native Number type.
	 */
	parse(path:string, options:{ coerce?:boolean; } = {}):Object {
		var key:string;
		var match:RegExpExecArray;

		if ((match = this._pathPattern.exec(path))) {
			var kwArgs:HashMap<any> = {};

			for (var i = 0, j = this._pathKeys.length; i < j; ++i) {
				key = this._pathKeys[i];

				var value:any = match[i + 1];
				value = isNaN(value) || options.coerce === false ? value : +value;

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

			if (match[match.length - 1]) {
				var extraArguments:HashMap<any> = ioQuery.queryToObject(match[match.length - 1]);
				// a simple mixin won't work here because we need to combine extra arguments if they exist on the
				// parsed kwArgs object instead of clobbering them
				for (key in extraArguments) {
					if (key in kwArgs) {
						kwArgs[key] = (<string[]>[]).concat(kwArgs[key], extraArguments[key]);
					}
					else {
						kwArgs[key] = extraArguments[key];
					}
				}
			}

			return kwArgs;
		}

		return null;
	}

	/**
	 * Return a path for the given hash map that corresponds to this route's path specification.
	 *
	 * @param kwArgs - A hash map of arguments to serialize into a path.
	 */
	serialize(kwArgs:HashMap<any>):string {
		// if someone passes an object they probably do not expect it to lose several of its properties, but we delete
		// properties from this object as they are processed
		kwArgs = <any> lang.mixin({}, kwArgs);

		var path:string = '';
		var key:string;

		for (var i:number = 0, j:number = this._pathParts.length; i < j; ++i) {
			var part:any = this._pathParts[i];

			if (typeof part === 'string') {
				path += part;
			}
			else {
				key = part.key;

				if (!(key in kwArgs)) {
					throw new Error('Missing required key "' + key + '"');
				}

				var value:any = kwArgs[key];
				var pattern:RegExp = part.pattern;

				if (value instanceof Array) {
					value = value.shift();
				}

				if (!pattern.test(value)) {
					throw new Error('Key "' + key + '" does not match pattern ' + pattern);
				}

				path += value;

				if (!(kwArgs[key] instanceof Array) || kwArgs[key].length === 0) {
					delete kwArgs[key];
				}
			}
		}

		// "if kwArgs has any properties"
		for (key in kwArgs) {
			path += '?' + ioQuery.objectToQuery(kwArgs);
			break;
		}

		return path;
	}
}

BaseRoute.prototype._isCaseSensitive = true;

module BaseRoute {
	export interface Getters extends Observable.Getters {
		(key:'isCaseSensitive'):boolean;
		(key:'path'):string;
	}
	export interface Setters extends Observable.Setters {
		(key:'isCaseSensitive', value:boolean):void;
		(key:'path', value:string):void;
	}
}

export = BaseRoute;

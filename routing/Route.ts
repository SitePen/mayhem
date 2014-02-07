/// <reference path="../dojo" />

import ioQuery = require('dojo/io-query');
import lang = require('dojo/_base/lang');
import core = require('../interfaces');

/**
 * A Route is an object that provides round-trip serialising and parsing of routes based on URL-like path fragments. The
 * Route class is a base class for different Routes that provides functionality for matching, parsing, and
 * serializing paths on a route using a URL-like syntax.
 *
 * example:
 * 	Basic usage:
 *
 *  |	var route = new Route({ path: '<view:foo|bar|baz>/<id:\\d+>' });
 *  |	route.test('foo/1234'); // -> true
 *  |	route.test('foo/'); // -> false (path must match fully)
 *  |	route.test('bar/foo/1234'); // -> false (path must match from the start of the string)
 *  |	route.parse('foo/1234'); // -> { view: 'foo', id: 1234 }
 *  |	route.serialize({ view: 'foo', id: 1234 }); // -> 'foo/1234'
 *  |	route.serialize({ view: 'foo' }); // -> throws error due to insufficient number of arguments
 *  |	route.serialize({ view: 'foo', id: 1234, bar: true }); // -> 'foo/1234?bar=true'
 *
 * example:
 * 	Multiple named capturing groups with the same identifier:
 *
 *  |	var route = new Route({ path: '<view:\\w+>/<view:\\w+>' });
 *  |	route.parse('foo/bar'); // -> { view: [ 'foo', 'bar' ] }
 *  |	route.serialize({ view: [ 'foo', 'bar' ] }); // -> 'foo/bar'
 *  |	route.serialize({ view: [ 'foo' ] }); // -> throws error due to insufficient number of arguments
 */
class Route implements core.IComponent {
	/**
	 * The path that matches this Route. The path is a string that can contain named capturing groups using the syntax
	 * `<identifier:pattern>`, where the regular expression given in `pattern` will be captured and placed on the
	 * property labelled with `identifier`. Multiple named capturing groups with the same identifier may be used (e.g.
	 * `<view:\\w+>/<view:\\w+>`), in which case the associated value will be an array.
	 * 
	 * Do not use capturing groups (`()`) within regular expression patterns. This will break the Route. Non-capturing
	 * groups (`(?:)`) may be used if necessary.
	 *
	 * Routes are always matched from the start of the string, so cannot be used to find matches within the middle of a
	 * path.
	 *
	 * Any extra arbitrary arguments that are not explicitly defined as being part of a Route path are provided using a
	 * standard query-string attached to the end of the path (e.g. `foo/bar?baz=true`).
	 */
	private _path:string;

	/** Whether or not the path should be case-sensitive. */
	private _isCaseSensitive:boolean = true;

	private _app:core.IApplication;

	get(key:'path'):string;
	get(key:'isCaseSensitive'):boolean;
	get(key:'app'):core.IApplication;
	get(key:string):any;
	get(key:string):any {
		return this['_' + key];
	}

	set(key:'path', value:string):void;
	set(key:'isCaseSensitive', value:boolean):boolean;
	set(key:'app', value:core.IApplication):void;
	set(key:string, value:any):void;
	set(kwArgs:Object):void;
	set(key:string, value?:any):void {
		// TODO: handle object key
		this['_' + key] = value;
	}

	_pathPattern:RegExp;
	_pathParts:Array<any>;
	_pathKeys:Array<string>;

	/**
	 * Sets the case-sensitivity flag on path processing regular expression patterns.
	 */
	/* protected */ _isCaseSensitiveSetter(isCaseSensitive:boolean):boolean {
		// TODO: It sure seems like Stateful should do this optimisation instead.
		if (this._isCaseSensitive === isCaseSensitive) {
			return isCaseSensitive;
		}

		var regExpFlags = isCaseSensitive ? '' : 'i';

		if (this._pathPattern) {
			this._pathPattern = new RegExp(this._pathPattern.source, regExpFlags);

			for (var i = 0, j = this._pathParts.length, part; i < j; ++i) {
				part = this._pathParts[i];

				// These patterns are updated here instead of being generated every time someone calls serialize
				// because calls to serialize are more common
				if (part.pattern) {
					part.pattern = new RegExp(part.pattern.source, regExpFlags);
				}
			}
		}

		return this._isCaseSensitive = isCaseSensitive;
	}

	/**
	 * Disassembles a path specification into its consitutuent parts for use when parsing and serialising route paths.
	 */
	/* protected */ _pathSetter(path:string):string {
		/**
		 * Gets a part of the path string corresponding to the given start and end indexes and escapes it for use within
		 * a regular expression.
		 */
		function getStaticPart(start:number, end?:number):string {
			return path.slice(start, end).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
		}

		var parameterPattern = /<([^:]+):([^>]+)>/g,
			realPathPattern = '^',
			pathKeys = [],
			pathParts = [],
			lastIndex = 0,
			match,
			staticPart,
			regExpFlags = this._isCaseSensitive ? '' : 'i';

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
		realPathPattern += staticPart + '(?:\\?(.*))?';
		pathParts.push(staticPart);

		this._pathKeys = pathKeys;
		this._pathParts = pathParts;
		this._pathPattern = new RegExp(realPathPattern, regExpFlags);

		return this._path = path;
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
	 * @param path
	 * The path to parse into a hash map.
	 *
	 * @param options 
	 * Options for generating the returned hash map. The available options are:
	 *   * coerce (boolean, default: true) - Whether or not to coerce numeric arguments to a native Number type.
	 */
	parse(path:string, options?:{ coerce?:boolean }):Object {
		options = options || {};

		var key,
			match;

		if ((match = this._pathPattern.exec(path))) {
			var kwArgs = {};

			for (var i = 0, j = this._pathKeys.length; i < j; ++i) {
				key = this._pathKeys[i];

				var value = match[i + 1];
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
				var extraArguments = ioQuery.queryToObject(match[match.length - 1]);
				// a simple mixin won't work here because we need to combine extra arguments if they exist on the
				// parsed kwArgs object instead of clobbering them
				for (key in extraArguments) {
					if (key in kwArgs) {
						kwArgs[key] = [].concat(kwArgs[key], extraArguments[key]);
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
	 * @param kwArgs
	 * A hash map of arguments to serialize into a path.
	 */
	serialize(kwArgs:{}):string {
		// if someone passes an object they probably do not expect it to lose several of its properties, but we
		// delete properties from this object as they are processed
		kwArgs = lang.mixin({}, kwArgs);

		var path = '',
			key;

		for (var i = 0, j = this._pathParts.length; i < j; ++i) {
			var part = this._pathParts[i];

			if (typeof part === 'string') {
				path += part;
			}
			else {
				key = part.key;

				if (!(key in kwArgs)) {
					throw new Error('Missing required key "' + key + '"');
				}

				var value = kwArgs[key],
					pattern = part.pattern;

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

export = Route;

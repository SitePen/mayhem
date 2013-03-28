define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'dojo/io-query',
	'./Component'
], function (lang, declare, ioQuery, Component) {
	return declare(Component, {
		//	summary:
		//		A Route is an object that provides round-trip serialising and parsing of route paths.

		//	path: string
		//		The path for this route.
		path: null,

		//	isCaseSensitive: boolean
		//		Whether or not the path should be handled case-sensitively.
		isCaseSensitive: true,

		_isCaseSensitiveSetter: function (/**boolean*/ isCaseSensitive) {
			//	summary:
			//		Sets the case-sensitivity flag on path processing regular expression patterns.

			// TODO: It sure seems like Stateful should do this optimisation instead.
			if (this.isCaseSensitive === isCaseSensitive) {
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

			return this.isCaseSensitive = isCaseSensitive;
		},

		_pathSetter: function (/**string*/ path) {
			//	summary:
			//		Disassembles a path specification into its consitutuent parts for use when parsing and serialising
			//		route paths.

			var parameterPattern = /<([^:]+):([^>]+)>/g,
				realPathPattern = '^',
				pathKeys = [],
				pathParts = [],
				lastIndex = 0,
				match,
				staticPart,
				regExpFlags = this.isCaseSensitive ? '' : 'i';

			while ((match = parameterPattern.exec(path))) {
				pathKeys.push(match[1]);

				staticPart = path.slice(lastIndex, match.index);
				pathParts.push(staticPart, { key: match[1], pattern: new RegExp(match[2], regExpFlags) });

				realPathPattern += staticPart + '(' + match[2] + ')';

				lastIndex = match.index + match[0].length;
			}

			staticPart = path.slice(lastIndex);
			realPathPattern += staticPart + '(?:\\?(.*))?';
			pathParts.push(staticPart);

			this._pathKeys = pathKeys;
			this._pathParts = pathParts;
			this._pathPattern = new RegExp(realPathPattern, regExpFlags);

			return this.path = path;
		},

		test: function (/**string*/ path) {
			//	summary:
			//		Tests whether or not the given path matches this route.
			//	returns: boolean

			return this._pathPattern.test(path);
		},

		parse: function (/**string*/ path, /**Object*/ options) {
			//	summary:
			//		Given a path, parse the arguments from the path and return them according to the route's path
			//		specification.
			//	path:
			//		The path to parse into a hash map.
			//	options:
			//		Options for generating the returned hash map. The available options are:
			//		* coerce (boolean, default: true) - Whether or not to coerce numeric arguments to a native Number
			//		  type.
			//	returns: Object

			options = options || {};

			var match;
			if ((match = this._pathPattern.exec(path))) {
				var kwArgs = {};

				for (var i = 0, j = this._pathKeys.length, value; i < j; ++i) {
					value = match[i + 1];
					kwArgs[this._pathKeys[i]] = isNaN(value) || options.coerce === false ? value : +value;
				}

				if (match[match.length - 1]) {
					lang.mixin(kwArgs, ioQuery.queryToObject(match[match.length - 1]));
				}

				return kwArgs;
			}

			return null;
		},

		serialize: function (/**Object*/ kwArgs) {
			//	summary:
			//		Return a path for the given hash map that corresponds to this route's path specification.
			//	kwArgs:
			//		A hash map of arguments to serialise into a path.
			//	returns: string

			var path = '',
				key,
				pattern;

			// avoid side-effects caused by deleting properties from the kwArgs object
			kwArgs = lang.mixin({}, kwArgs);

			for (var i = 0, j = this._pathParts.length, part; i < j; ++i) {
				part = this._pathParts[i];
				if (typeof part === 'string') {
					path += part;
				}
				else {
					key = part.key;
					pattern = part.pattern;

					if (!(key in kwArgs)) {
						throw new Error('Missing required key "' + key + '"');
					}

					if (!pattern.test(kwArgs[key])) {
						throw new Error('Key "' + key + '" does not match pattern ' + pattern);
					}

					path += kwArgs[key];
					delete kwArgs[key];
				}
			}

			// "if kwArgs has any properties"
			for (key in kwArgs) {
				path += '?' + ioQuery.objectToQuery(kwArgs);
				break;
			}

			return path;
		}
	});
});
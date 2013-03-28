define([
	'dojo/_base/lang',
	'dojo/_base/declare',
	'dojo/io-query',
	'./Component'
], function (lang, declare, ioQuery, Component) {
	return declare(Component, {
		path: null,
		isCaseSensitive: true,

		_isCaseSensitiveSetter: function (isCaseSensitive) {
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

		_pathSetter: function (path) {
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

		parse: function (path) {
			//	summary:
			//		Given a path, parse the arguments from the path and return them according to the routing
			//		information.
			//	returns: Object

			var match;
			if ((match = this._pathPattern.exec(path))) {
				var kwArgs = {};

				for (var i = 0, j = this._pathKeys.length; i < j; ++i) {
					kwArgs[this._pathKeys[i]] = match[i + 1];
				}

				if (match[match.length - 1]) {
					lang.mixin(kwArgs, ioQuery.queryToObject(match[match.length - 1]));
				}

				return kwArgs;
			}

			return null;
		},

		serialize: function (kwArgs) {
			//	summary:
			//		Return a path for the given hash map.
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
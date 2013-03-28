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
			if (this._pathExpression) {
				this._pathExpression = new RegExp(this._pathExpression.source, isCaseSensitive ? '' : 'i');
			}

			return this.isCaseSensitive = isCaseSensitive;
		},

		_pathSetter: function (path) {
			var match,
				pathPatternRegExp = /<([^:]+):([^>]+)>/g,
				pathExpression = '^',
				pathKeys = this._pathKeys = [],
				pathParts = this._pathParts = [],
				lastIndex = 0,
				staticPart;

			while ((match = pathPatternRegExp.exec(path))) {
				pathKeys.push(match[1]);

				staticPart = path.slice(lastIndex, match.index);
				pathParts.push(staticPart, pathKeys.length - 1);

				pathExpression += staticPart + '(' + match[2] + ')';

				lastIndex = match.index + match[0].length;
			}

			staticPart = path.slice(lastIndex);
			pathExpression += staticPart + '\\?(.*)';
			pathParts.push(staticPart);

			this._pathExpression = new RegExp(pathExpression, this.isCaseSensitive ? '' : 'i');

			return this.path = path;
		},

		parse: function (path) {
			//	summary:
			//		Given a path, parse the arguments from the path and return them according to the routing
			//		information.
			//	returns: Object

			var match;
			if ((match = this._pathExpression.exec(path))) {
				var kwArgs = {};

				for (var i = 0, j = this._pathKeys.length; i < j; ++i) {
					kwArgs[this._pathKeys[i]] = match[i + 1];
				}

				lang.mixin(kwArgs, ioQuery.queryToObject(match[match.length - 1]));

				return kwArgs;
			}

			return null;
		},

		serialize: function (kwArgs) {
			//	summary:
			//		Return a path for the given hash map.
			//	returns: string

			var path = '',
				key;

			// avoid side-effects caused by deleting properties from the kwArgs object
			kwArgs = lang.mixin({}, kwArgs);

			for (var i = 0, j = this._pathParts.length, part; i < j; ++i) {
				part = this._pathParts[i];
				if (typeof part === 'number') {
					key = this._pathKeys[part];

					if (!(key in kwArgs)) {
						throw new Error('Missing required key "' + part + '"');
					}

					path += kwArgs[key];
					delete kwArgs[key];
				}
				else {
					path += part;
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
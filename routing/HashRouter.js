define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/topic',
	'dojo/hash',
	'./Router'
], function (declare, lang, topic, hash, Router) {
	return declare(Router, {
		//	summary:
		//		A router implementation that operates using the window's location hash.

		//	pathPrefix: string
		//		A prefix that is expected to exist on all URLs loaded through this router.
		pathPrefix: '!/',

		_changeHandle: null,

		startup: function () {
			//	summary:
			//		Starts the router, using the current hash as the initial route to load. If no hash is set, the
			//		`defaultRoute` will be set as the hash and loaded.

			this.inherited(arguments);

			var initialRoute = hash();
			if (initialRoute) {
				this._handlePathChange(this.normalizeId(initialRoute));
			}
			else {
				hash(this.createPath(this.defaultRoute), true);
			}
		},

		resume: function () {
			if (!this._changeHandle) {
				this._changeHandle = topic.subscribe('/dojo/hashchange', lang.hitch(this, '_handlePathChange'));
			}
		},

		pause: function () {
			if (this._changeHandle) {
				this._changeHandle.remove();
				this._changeHandle = null;
			}
		},

		go: function () {
			if (!this._changeHandle) {
				throw new Error('Router is paused');
			}

			hash(this.createPath.apply(this, arguments));
		},

		resetPath: function (/**string*/ path, /**boolean*/ replace) {
			this.pause();
			hash(path, replace);
			this.resume();
		},

		createPath: function (/**string*/ id, /**Object*/ kwArgs) {
			//	summary:
			//		Creates a URL fragment that can be used to link to the given route.
			//	returns: string

			id = this.normalizeId(id);

			var route = this._routes[this._routeIds[id]];

			if (!route) {
				throw new Error('Invalid route id "' + id + '"');
			}

			return '#' + this.pathPrefix + route.serialize(kwArgs);
		},

		// TODO: This should get a better name once it is determined exactly what is being normalized
		normalizeId: function (id) {
			// TODO: If something is passing an thing that is prefixed they are probably passing the path instead,
			// which is not correct
			if (id.indexOf(this.pathPrefix) === 0) {
				id = id.slice(this.pathPrefix.length);
			}

			return this.inherited(arguments, [ id ]);
		}
	});
});

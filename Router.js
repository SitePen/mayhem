define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/aspect',
	'dojo/topic',
	'dojo/hash',
	'dojo/io-query',
	'./Component',
	'./Route'
], function (declare, lang, aspect, topic, hash, ioQuery, Component, Route) {
	// TODO: Make into its own class if this pans out
	function RouteEvent(kwArgs) {
		for (var k in kwArgs) {
			this[k] = kwArgs[k];
		}
	}
	RouteEvent.prototype = {
		constructor: RouteEvent,
		oldPath: null,
		newPath: null,
		router: null,
		paused: false,
		cancelled: false,
		pause: function () {
			if (this.paused) {
				return;
			}

			this.paused = true;
			this.router.pause();

			// TODO: Queue this stuff instead, since if someone resumes in the same loop we don't really want to do
			// anything.
			hash(this.oldPath, true);
		},
		resume: function () {
			if (!this.paused || this.cancelled) {
				return;
			}

			this.paused = false;
			hash(this.newPath);
			this.router.resume();
		},
		cancel: function () {
			this.pause();
			this.cancelled = true;
		}
	};

	return declare(Component, {
		//	defaultRoute: String?
		//		Specifies default route to navigate to if no hash is initially set.

		//	routes: Array
		//		Array of arrays; each inner array contains 2 items, the first being
		//		a string or RegExp for the pattern to register, and the second being
		//		the module id of the controller to load.

		_oldPath: null,

		_inPathChange: false,

		_routesSetter: function (routes) {
			// TODO: Should be a StatefulArray
			var _routes = [];

			for (var i = 0, j = routes.length, route; i < j; ++i) {
				if (!(route instanceof Route)) {
					route = new Route(typeof route === 'string' ? { path: route } : route);
				}

				_routes.push(route);
			}

			return this._routes = _routes;
		},

		constructor: function () {
			this._activeRoutes = [];
		},

		startup: function () {
			this.startup = function () {};
			this.resume();
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

		_handlePathChange: function (newPath) {
			if (newPath !== this._oldPath) {
				var i = 0,
					event = new RouteEvent({
						oldPath: this._oldPath,
						newPath: newPath,
						router: this
					});

				(function activateRoutes() {
					for (var route; (route = this._routes[i]); ++i) {
						if (route.test(newPath)) {
							route.activate(event);

							if (event.cancelled) {
								return;
							}

							if (event.paused) {
								var handle = aspect.after(event, 'resume', function () {
									handle.remove();
									activateRoutes();
								});

								return;
							}
						}
					}
				}());
			}
		},

		createUrl: function (path, params) {
			params = ioQuery.objectToQuery(params);
			params = params ? '?' + params : '';

			return '#' + path + params;
		}
	});
});
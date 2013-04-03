define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/topic',
	'dojo/hash',
	'dojo/when',
	'dojo/promise/all',
	'./Component',
	'./PausableEvented',
	'./Route'
], function (declare, lang, topic, hash, when, whenAll, Component, PausableEvented, Route) {
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

		pause: function () {
			this.router.pause();
			hash(this.oldPath, true);
			this.router.resume();
		},

		resume: function () {
			if (this.canceled) {
				return;
			}

			this.router.pause();
			hash(this.newPath);
			this.router.resume();
		},

		preventDefault: function () {
			// if paused, the path was already changed back to the old path and does not need to be changed again
			if (!this.paused) {
				this.router.pause();
				hash(this.oldPath, true);
				this.router.resume();
			}
		}
	};

	return declare([ Component, PausableEvented ], {
		//	routes: Object.<Route>
		//		Hash map of routes, where the key is the unique ID of the route and the value is a Route object.
		//		Routes are nested by specifying IDs that correspond to paths.

		//	controllerPath: string
		//		The default location for controllers.
		controllerPath: 'app/controllers',

		//	viewPath: string
		//		The default location for views.
		viewPath: 'app/views',

		//	defaultRoute: string
		//		The default route when the application is loaded without an existing route.
		defaultRoute: 'index',

		//	pathPrefix: string
		//		A prefix that is expected to exist on all URLs loaded through this router.
		routePrefix: '!/',

		//	notFoundRoute: string
		//		The route to load when an unmatched route is loaded.
		notFoundRoute: 'error',

		_oldPath: null,

		_activeRoutes: null,

		// TODO: If routes never needs to be used as an array, remove _routeIds and restore _routes to being a hash
		// map.
		_routeIds: null,

		_routes: null,

		_routesSetter: function (routeMap) {
			var routes = this._routes = [],
				routeIds = this._routeIds = {};

			var kwArgs;
			for (var routeId in routeMap) {
				kwArgs = routeMap[routeId];

				if (typeof kwArgs === 'string') {
					kwArgs = { path: kwArgs };
				}

				kwArgs.id = routeId;
				kwArgs.router = this;
				kwArgs.path || (kwArgs.path = routeId);

				// If view or controller are explicitly set to null, then they are generated using a generic
				// Controller or View component.
				kwArgs.view === undefined && (kwArgs.view = routeId);
				kwArgs.controller === undefined && (kwArgs.controller = routeId);

				routeIds[routeId] = routes.push(new Route(kwArgs));
			}

			// TODO: Better way to do defaults?
			if (!routeIds[this.notFoundRoute]) {
				routeIds[this.notFoundRoute] = routes.push(new Route({
					id: this.notFoundRoute,
					router: this,
					path: '',
					view: '/framework/view/ErrorView',
					controller: null
				}));
			}

			return routeMap;
		},

		constructor: function () {
			this._activeRoutes = [];
		},

		startup: function () {
			this.startup = this._routesSetter = function () {};
			this.resume();

			var initialRoute = hash();
			if (!initialRoute) {
				hash((initialRoute = this.routePrefix + this.defaultRoute), true);
			}

			this._handlePathChange(initialRoute);
		},

		destroy: function () {
			this.destroy = function () {};
			this.pause();
			this._activeRoutes = this._routes = null;
		},

		resume: function () {
			//	summary:
			//		Starts the router responding to hash changes.

			if (!this._changeHandle) {
				this._changeHandle = topic.subscribe('/dojo/hashchange', lang.hitch(this, '_handlePathChange'));
			}
		},

		pause: function () {
			//	summary:
			//		Prevents the router from responding to any hash changes.

			if (this._changeHandle) {
				this._changeHandle.remove();
				this._changeHandle = null;
			}
		},

		go: function () {
			//	summary:
			//		Transitions to a new route.

			if (!this._changeHandle) {
				throw new Error('Router is paused');
			}

			hash(this.createUrl.apply(this, arguments));
		},

		normalizeId: function (id) {
			//	summary:
			//		Normalizes a string to a real ID value.
			//	returns: string

			if (id.indexOf(this.routePrefix) === 0) {
				id = id.slice(this.routePrefix.length);
			}

			if (id === '') {
				id = 'index';
			}

			if (id.charAt(id.length - 1) === '/') {
				id += 'index';
			}

			return id;
		},

		_handlePathChange: function (newPath) {
			//	summary:
			//		Activates and deactivates routes in response to a path change.

			// TODO: Maybe this is the wrong name for this function
			newPath = this.normalizeId(newPath);

			if (newPath === this._oldPath) {
				return;
			}

			var event = new RouteEvent({
					cancelable: true,
					pausable: true,
					oldPath: this._oldPath,
					newPath: newPath,
					router: this
				}),
				self = this;

			this.emit('change', event).then(function () {
				if (!event.canceled) {
					whenAll([
						self._exitRoutes(event),
						self._enterRoutes(event)
					]).then(function () {
						function emitIdle() {
							self.emit('idle', new RouteEvent({
								oldPath: event.oldPath,
								newPath: event.newPath,
								router: self
							}));
						}

						if (!self._activeRoutes.length) {
							return self._handleNotFoundRoute(event).then(emitIdle);
						}
						else {
							emitIdle();
						}
					});
				}
			});
		},

		_exitRoutes: function (event) {
			var activeRoutes = this._activeRoutes,
				exits = [];

			for (var i = activeRoutes.length - 1, route; (route = activeRoutes[i]); --i) {
				if (!route.test(event.newPath)) {
					exits.push(route.exit(event));
					activeRoutes.splice(i, 1);
				}
			}

			return whenAll(exits);
		},

		_enterRoutes: function (event) {
			var entrances = [];

			for (var i = 0, route; (route = this._routes[i]); ++i) {
				if (route.test(event.newPath)) {
					entrances.push(route.enter(event));
					this._activeRoutes.push(route);
				}
			}

			return whenAll(entrances);
		},

		_handleNotFoundRoute: function () {
			var notFoundRoute = this._routes[this._routeIds[this.notFoundRoute]];
			return when(notFoundRoute.enter(event));
		},

		createUrl: function (id, params) {
			//	summary:
			//		Creates a URL fragment that can be used to link to the given route ID.
			//	returns: string

			id = this.normalizeId(id);

			var route = this._routes[this._routeIds[id]];

			if (!route) {
				throw new Error('Invalid route id "' + id + '"');
			}

			return '#' + this.routePrefix + route.serialize(params);
		}
	});
});
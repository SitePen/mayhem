define([
	'dojo/_base/declare',
	'dojo/_base/array',
	'dojo/when',
	'dojo/promise/all',
	'../has',
	'../Component',
	'../PausableEvented',
	'./Route',
	'./RouteEvent'
], function (declare, array, when, whenAll, has, Component, PausableEvented, Route, RouteEvent) {
	return declare([ Component, PausableEvented ], {
		//	summary:
		//		The Router module is a base component designed to be extended and used with a path-based routing
		//		mechanism, like a URL.

		//	routes: Object.<Route|Object|string>
		//		Hash map of routes, where the key is the unique ID of the route and the value is a Route object (or
		//		subclass of Route), a hash map that is passed to the Route constructor, or a string that is used as the
		//		`path` property for a new route.
		//
		//		Routes can be nested by specifying path-like route IDs, separated by a forward-slash. For example,
		//		a route with the ID `foo/bar` would be a child of the route with the ID `foo`. Route nesting is
		//		independent of path nesting, but typically the paths used for a route will correspond to the route
		//		hierarchy, since parent routes for matched child routes are not currently activated when a child is
		//		activated. Route nesting in this manner is necessary to load sub-views into parent views.
		//
		//		See `framework/routing/Route` for more information on available Route properties. By default, Router
		//		will set the `path`, `view`, and `controller` properties to the ID of the route if they are not
		//		explicitly set.
		//
		//		Once the router has been started, routes can no longer be changed.

		//	controllerPath: string
		//		The default location for controllers.
		controllerPath: 'app/controllers',

		//	viewPath: string
		//		The default location for views.
		viewPath: 'app/views',

		//	defaultRoute: string
		//		The default route when the application is loaded without an existing route.
		defaultRoute: 'index',

		//	notFoundRoute: string
		//		The route to load when an unmatched route is loaded.
		notFoundRoute: 'error',

		_oldPath: null,
		_activeRoutes: null,
		// TODO: If routes never needs to be used as an array, remove _routeIds and restore _routes to being a hash
		// map.
		_routeIds: null,
		_routes: null,

		_routesSetter: function (/**Object*/ routeMap) {
			var routes = this._routes = [],
				routeIds = this._routeIds = {};

			var kwArgs,
				route;
			for (var routeId in routeMap) {
				kwArgs = routeMap[routeId];

				if (kwArgs.isInstanceOf ? kwArgs.isInstanceOf(Route) : kwArgs instanceof Route) {
					route = kwArgs;
					route.id = routeId;
				}
				else {
					if (typeof kwArgs === 'string') {
						kwArgs = { path: kwArgs };
					}

					kwArgs.id = routeId;
					kwArgs.router = this;

					// Path might be the empty string, and this is OK, but it cannot be null or undefined
					kwArgs.path == null && (kwArgs.path = routeId);

					// If view or controller are explicitly set to null, then they are generated using a generic
					// Controller or View component.
					kwArgs.view === undefined && (kwArgs.view = routeId);
					kwArgs.controller === undefined && (kwArgs.controller = routeId);

					route = new Route(kwArgs);
				}

				routeIds[routeId] = routes.push(route) - 1;
			}

			// TODO: Better way to do defaults?
			if (!routeIds[this.notFoundRoute]) {
				routeIds[this.notFoundRoute] = routes.push(new Route({
					id: this.notFoundRoute,
					router: this,
					path: '',
					view: '/framework/view/ErrorView',
					controller: null
				})) - 1;
			}

			// TODO: This is a naive, inefficient algorithm that could do with being less awful if someone wants to
			// spend a little time on it
			linkParentRoutes: for (var i = 0; (route = routes[i]); ++i) {
				var parentDelimiterIndex = route.id.lastIndexOf('/');
				if (parentDelimiterIndex === -1) {
					route.parent = this.app;
					continue;
				}

				var parentRouteId = route.id.slice(0, parentDelimiterIndex);
				for (var j = 0, parentRoute; (parentRoute = routes[j]); ++j) {
					// TODO: If a route ID is an empty string, should it be considered as parent candidate?
					// Right now it is, but I am not sure why someone would do this except as a mistake.
					if (parentRoute.id === parentRouteId) {
						route.parent = parentRoute;
						continue linkParentRoutes;
					}
				}

				console.warn('Could not find a parent route for ' + route.id);
			}

			return routeMap;
		},

		constructor: function () {
			this._activeRoutes = [];
		},

		startup: function () {
			//	summary:
			//		Starts listening for new path changes.
			this.startup = this._routesSetter = function () {};
			this.resume();
		},

		destroy: function () {
			//	summary:
			//		Stops listening for any new path changes, exits all active routes, and destroys all registered
			//		routes.

			this.destroy = function () {};
			this.pause();

			var route,
				event = new RouteEvent({
					oldPath: this._oldPath,
					newPath: null,
					router: this
				});

			while ((route = this._activeRoutes.pop())) {
				route.exit(event);
			}

			while ((route = this._routes.pop())) {
				route.destroy && route.destroy();
			}

			this._activeRoutes = this._routes = null;
		},

		resume: function () {
			//	summary:
			//		Starts the router responding to hash changes.

			if (has('debug')) {
				throw new Error('Abstract method "resume" not implemented');
			}
		},

		pause: function () {
			//	summary:
			//		Stops the router from responding to any hash changes.

			if (has('debug')) {
				throw new Error('Abstract method "pause" not implemented');
			}
		},

		go: function () {
			//	summary:
			//		Transitions to a new route.
			//	id: string
			//		The route ID.
			//	kwArgs: Object
			//		Arguments to the route.

			if (has('debug')) {
				throw new Error('Abstract method "go" not implemented');
			}
		},

		resetPath: function () {
			//	summary:
			//		Resets the path of the underlying state mechanism without triggering a routing update.
			//	path: string
			//		The path to set.
			//	replace: boolean
			//		Whether or not to replace the previous path in history with the provided path.

			if (has('debug')) {
				throw new Error('Abstract method "resetPath" not implemented');
			}
		},

		createPath: function () {
			//	summary:
			//		Creates a unique identifier for the given route.
			//	id: string
			//		The route ID.
			//	kwArgs: Object
			//		Arguments for the route.
			//	returns: string

			if (has('debug')) {
				throw new Error('Abstract method "createPath" not implemented');
			}
		},

		normalizeId: function (/**string*/ id) {
			//	summary:
			//		Normalizes a string to a real ID value.
			//	returns: string

			if (id === '') {
				id = 'index';
			}

			if (id.charAt(id.length - 1) === '/') {
				id += 'index';
			}

			return id;
		},

		_handlePathChange: function (/**string*/ newPath) {
			//	summary:
			//		Activates and deactivates routes in response to a path change.
			//	newPath:
			//		The new path.

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

		_exitRoutes: function (/**framework/routing/RouteEvent*/ event) {
			//	summary:
			//		Exits active routes that do not match the new path given in `event`.
			//	returns: dojo/promise/Promise
			//		A promise that is resolved once all matching routes have finished deactivating.

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

		_enterRoutes: function (/**framework/routing/RouteEvent*/ event) {
			//	summary:
			//		Enters routes that match the new path given in `event`.
			//	returns: dojo/promise/Promise
			//		A promise that is resolved once all matching routes have finished activating.

			var entrances = [];

			for (var i = 0, route; (route = this._routes[i]); ++i) {
				if (route.test(event.newPath)) {
					entrances.push(route.enter(event));

					if (array.indexOf(this._activeRoutes, route) === -1) {
						this._activeRoutes.push(route);
					}
				}
			}

			return whenAll(entrances);
		},

		_handleNotFoundRoute: function () {
			//	summary:
			//		Handles not found routes by activating the not-found route.
			//	returns: dojo/promise/Promise

			var notFoundRoute = this._routes[this._routeIds[this.notFoundRoute]];
			this._activeRoutes.push(notFoundRoute);
			return when(notFoundRoute.enter(event));
		}
	});
});
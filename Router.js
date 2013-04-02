define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/aspect',
	'dojo/topic',
	'dojo/hash',
	'dojo/when',
	'dojo/promise/all',
	'./Component',
	'./Route'
], function (declare, lang, aspect, topic, hash, when, whenAll, Component, Route) {
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
		isCancelable: false,
		isPausable: false,
		pause: function () {
			if (!this.isPausable) {
				throw new Error('Event is not pausable');
			}

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
			if (!this.isCancelable) {
				throw new Error('Event is not cancelable');
			}

			this.pause();
			this.cancelled = true;
		}
	};

	return declare(Component, {
		//	defaultRoute: String?
		//		Specifies default route to navigate to if no hash is initially set.

		//	routes: Object.<Route>
		//		Hash map of routes, where the key is the unique ID of the route and the value is a Route object.

		//	controllerPath: string
		//		The default location for controllers.
		controllerPath: 'app/controllers',

		//	viewPath: string
		//		The default location for views.
		viewPath: 'app/views',

		_oldPath: null,

		_activeRoutes: null,

		_routesSetter: function (routes) {
			// TODO: Should be a Stateful?
			var _routes = {};

			var kwArgs;
			for (var routeId in routes) {
				kwArgs = routes[routeId];

				if (typeof options === 'string') {
					kwArgs = { path: kwArgs };
				}

				kwArgs.id = routeId;

				// If view or controller are explicitly set to null, then they are generated using a generic
				// Controller or View component.
				kwArgs.view === undefined && (kwArgs.view = routeId);
				kwArgs.controller === undefined && (kwArgs.controller = routeId);

				_routes[routeId] = new Route(kwArgs);
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

		destroy: function () {
			this.destroy = function () {};
			this.pause();
			this._activeRoutes = this._routes = null;
		},

		resume: function () {
			//	summary:
			//		Starts the router listening to hash changes.

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
			//		Given a route ID, convert it to an appropriate value.
		},

		_handlePathChange: function (newPath) {
			var oldPath = this._oldPath;

			if (newPath !== oldPath) {
				var event = new RouteEvent({
					oldPath: oldPath,
					newPath: newPath,
					isCancelable: true,
					isPausable: true,
					router: this
				});

				var self = this,
					routeIndexesToExit = [],
					i = this._activeRoutes.length - 1;

				(function runExitTransition() {
					var route;
					while ((route = self._activeRoutes[i--])) {
						// All routes are informed that a transition is about to occur so that any route may stop it
						route.emit('beforeexit', event);

						if (event.cancelled) {
							return;
						}

						// Only active routes that don't match the new path are actually removed even though all are
						// notified
						if (!route.test(newPath)) {
							routeIndexesToExit.push(i);
						}

						if (event.paused) {
							var handle = aspect.after(event, 'resume', function () {
								handle.remove();
								runExitTransition();
							});
							return;
						}
					}

					when(self._exitRoutes(routeIndexesToExit)).then(function () {
						return self._enterRoutes(newPath);
					}).then(function () {
						self.emit('idle', new RouteEvent({ oldPath: oldPath, newPath: newPath, router: self }));
					});
				}());
			}
		},

		_exitRoutes: function (routeIndexesToExit) {
			var routeIndex,
				exits = [];

			while ((routeIndex = routeIndexesToExit.pop())) {
				exits.push(this._activeRoutes[routeIndex].exit());
				this._activeRoutes.splice(routeIndex, 1);
			}

			return whenAll(exits);
		},

		_enterRoutes: function (newPath) {
			var entrances = [];

			for (var routeId in this._routes) {
				var route = this._routes[routeId];
				if (route.test(newPath)) {
					this._activeRoutes.push(route);
					route.enter(newPath);
				}
			}

			return whenAll(entrances);
		},

		createUrl: function (id, params) {
			if (!this._routes[id]) {
				throw new Error('Invalid route id "' + id + '"');
			}

			return '#' + this._routes[id].serialize(params);
		}
	});
});
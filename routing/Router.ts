/// <reference path="../dojo" />

import array = require('dojo/_base/array');
import has = require('../has');
import ObservableEvented = require('../ObservableEvented');
import Promise = require('../Promise');
import Route = require('./Route');
import RouteEvent = require('./RouteEvent');
import routing = require('./interfaces');
import WebApplication = require('../WebApplication');

/**
 * The Router module is a base component designed to be extended and used with a path-based routing mechanism, like a
 * URL.
 */
class Router extends ObservableEvented implements routing.IRouter {
	/**
	 * The currently active routes.
	 *
	 * @protected
	 */
	_activeRoutes:Route[];

	/**
	 * The app for this router.
	 *
	 * @protected
	 */
	_app:WebApplication;

	/**
	 * The currently active path.
	 *
	 * @protected
	 * @get
	 * @set
	 */
	_currentPath:string;

	/**
	 * The default route when the application is loaded without an existing route.
	 *
	 * @protected
	 */
	_defaultRoute:any[] /* { 0:string; 1?:HashMap<any>; } */;

	/**
	 * The previous path after a route transition.
	 *
	 * @protected
	 */
	_lastPath:string;

	/**
	 * The route to load when an unmatched route is loaded.
	 *
	 * @protected
	 */
	_notFoundRoute:string;

	/**
	 * Hash map of routes, where the key is the unique ID of the route and the value is a Route object (or subclass of
	 * Route), a hash map that is passed to the Route constructor, or a string that is used as the `path` property for a
	 * new route.
	 *
	 * Routes can be nested by specifying path-like route IDs, separated by a forward-slash. For example, a route with
	 * the ID `foo/bar` would be a child of the route with the ID `foo`. Route nesting is independent of path nesting,
	 * but typically the paths used for a route will correspond to the route hierarchy, since parent routes for matched
	 * child routes are not currently activated when a child is activated. Route nesting in this manner is necessary to
	 * load sub-views into parent views.
	 *
	 * See `mayhem/routing/Route` for more information on available Route properties. By default, Router will set the
	 * `path`, `view`, and `viewModel` properties to the ID of the route if they are not explicitly set.
	 *
	 * For the moment, routes must only be set after the `viewModelPath`, `viewPath`, and `templatePath` have been set
	 * to their correct values.
	 *
	 * Once the router has been started, routes can no longer be changed.
	 *
	 * @get
	 * @set
	 * @protected
	 */
	_routes:HashMap<Route>;

	get:Router.Getters;
	on:Router.Events;
	set:Router.Setters;

	constructor(kwArgs?:{ [key:string]: any; }) {
		this._routes = {};
		this._activeRoutes = [];

		super(kwArgs);
	}

	/**
	 * Creates a unique identifier for the given route.
	 */
	createPath(path:string, kwArgs?:{}):string {
		if (has('debug')) {
			throw new Error('Abstract method "createPath" not implemented');
		}
		return null;
	}

	/**
	 * Stops listening for any new path changes, exits all active routes, and destroys all registered routes.
	 */
	destroy():void {
		this.destroy = function ():void {};
		this.pause();

		var route:Route;
		while ((route = this._activeRoutes.pop())) {
			route.exit();
		}

		var routes = this._routes;
		for (var id in routes) {
			route = routes[id];
			route.destroy && route.destroy();
		}

		this._activeRoutes = this._routes = null;
	}

	private _emitError(error:Error):void {
		this._app.handleError(error);
	}

	_enterRoutes(event:RouteEvent):IPromise<any> {
		var promises:Promise<void>[] = [];
		var route:Route;

		var routes:HashMap<Route> = this._routes;
		var newRoutes:Route[] = [];
		for (var id in routes) {
			route = routes[id];
			if (route.test(event.newPath)) {
				promises.push(route.run());
				newRoutes.push(route);

				if (array.indexOf(this._activeRoutes, route) === -1) {
					this._activeRoutes.push(route);
				}
			}
		}

		var self = this;
		return Promise.all(promises).then(function ():void {
			var route:Route;
			for (var i:number = 0; (route = newRoutes[i]); ++i) {
				route.enter(event);
			}
		}).otherwise(function (error:Error):void {
			self._emitError(error);
			throw error;
		});
	}

	_exitRoutes(event:RouteEvent):void {
		var activeRoutes:Route[] = this._activeRoutes;

		for (var i:number = activeRoutes.length - 1, route:Route; (route = activeRoutes[i]); --i) {
			if (!route.test(event.newPath)) {
				route.exit();
				activeRoutes.splice(i, 1);
			}
		}
	}

	/**
	 * Transitions to a new route.
	 */
	go(routeId:string, kwArgs?:{}):void {
		if (has('debug')) {
			throw new Error('Abstract method "go" not implemented');
		}
	}

	_handleNotFoundRoute(event:RouteEvent):IPromise<any> {
		var self = this;
		var notFoundRoute = this._routes[this._notFoundRoute];
		this._activeRoutes.push(notFoundRoute);
		return Promise.resolve(notFoundRoute.run()).then(function ():void {
			notFoundRoute.enter(event);
		}).otherwise(function (error:Error):void {
			self._emitError(error);
			throw error;
		});
	}

	_handlePathChange(newPath:string):void {
		if (newPath === this._lastPath) {
			return;
		}

		this.set('currentPath', newPath);

		var event = new RouteEvent({
			type: 'change',
			cancelable: true,
			pausable: true,
			oldPath: this._lastPath,
			newPath: newPath,
			router: this
		});

		var self = this;
		this._exitRoutes(event);
		this._enterRoutes(event).then(function ():any {
			self._lastPath = newPath;

			if (!self._activeRoutes.length) {
				self._handleNotFoundRoute(event);
			}
		});
	}

	/**
	 * Normalizes a string to a real ID value.
	 */
	normalizeId(id:string):string {
		// Normalize relative IDs
		var activeRoutes = this._activeRoutes;
		var idPrefix = activeRoutes.length ? (activeRoutes[activeRoutes.length - 1].get('path') + '/') : '';

		id = id.replace(/^\.\//, idPrefix);

		return id;
	}

	/**
	 * Stops the router from responding to any route changes.
	 */
	pause():void {
		if (has('debug')) {
			throw new Error('Abstract method "pause" not implemented');
		}
	}

	/**
	 * Resets the path of the underlying state mechanism without triggering a routing update.
	 *
	 * @param path The path to set.
	 * @param replace Whether or not to replace the previous path in history with the provided path.
	 */
	resetPath(path:string, replace?:boolean):void {
		if (has('debug')) {
			throw new Error('Abstract method "resetPath" not implemented');
		}
	}

	/**
	 * Starts the router responding to route changes.
	 */
	resume():void {
		if (has('debug')) {
			throw new Error('Abstract method "resume" not implemented');
		}
	}

	_routesGetter():HashMap<any> {
		return this._routes;
	}
	_routesSetter(routeMap:HashMap<any>):void {
		var routes = this._routes = {};

		if (!routeMap[this._notFoundRoute]) {
			routeMap[this._notFoundRoute] = {
				model: this._app,
				view: require.toAbsMid('../templating/html!') + require.toAbsMid('../views/Error.html')
			};
		}

		var kwArgs:any;
		var route:Route;

		for (var routeId in routeMap) {
			kwArgs = routeMap[routeId];

			if (kwArgs instanceof Route) {
				route = kwArgs;
				route.set({
					id: routeId,
					app: this._app
				});
			}
			else {
				kwArgs.id = routeId;
				kwArgs.router = this;
				kwArgs.app = this._app;

				// Path might be the empty string, and this is OK, but it cannot be null or undefined. Also,
				// because of the way path nesting works, only the last part of the route identifier is used as
				// the default path; the remainder is picked up when the parent relationship is established
				kwArgs.path == null && (kwArgs.path = routeId.replace(/^.*\//, ''));

				// TODO: Too magic?
				if (typeof kwArgs.view === 'string') {
					if (
						/* has file extension */ /\.[^\/]+$/.test(kwArgs.view) &&
						/* no plugin */ kwArgs.view.indexOf('!') === -1
					) {
						kwArgs.view = this._app.get('templatePath') + '!' + kwArgs.view;
					}
				}

				route = new Route(kwArgs);
			}

			routes[routeId] = route;
		}

		// TODO: This is a naive, inefficient algorithm that could do with being less awful if someone wants to
		// spend a little time on it
		linkParentRoutes: for (routeId in routes) {
			route = routes[routeId];
			var parentDelimiterIndex = routeId.lastIndexOf('/');

			if (parentDelimiterIndex === -1) {
				continue;
			}

			var parentRouteId = routeId.slice(0, parentDelimiterIndex),
				parentRoute:Route = routes[parentRouteId];

			if (!parentRoute) {
				throw new Error('Could not find a parent route for ' + route.get('id'));
			}

			route.set({
				parent: parentRoute,
				path: parentRoute.get('path') + '/' + route.get('path')
			});
		}
	}

	run():IPromise<void> {
		var self = this;
		var promise:Promise<void> = this._app.get('ui').run().then(function ():void {
			self.resume();
		});

		this._routesSetter = function ():void {};
		this.run = function ():IPromise<void> {
			return promise;
		};

		return promise;
	}
}

Router.prototype._defaultRoute = [ 'index' ];
Router.prototype._notFoundRoute = 'error';

module Router {
	export interface Events extends ObservableEvented.Events {}
	export interface Getters extends ObservableEvented.Getters, routing.IRouter.Getters {
		(key:'app'):WebApplication;
		(key:'defaultRoute'):any[];
		(key:'notFoundRoute'):string;
	}
	export interface Setters extends ObservableEvented.Setters, routing.IRouter.Setters {
		(key:'defaultRoute', value:any[]):void;
		(key:'notFoundRoute', value:string):void;
	}
}

export = Router;

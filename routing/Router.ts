/// <reference path="../dojo" />

import Deferred = require('dojo/Deferred');
import ObservableEvented = require('../ObservableEvented');
import Route = require('./Route');
import RouteEvent = require('./RouteEvent');
import array = require('dojo/_base/array');
import core = require('../interfaces');
import has = require('../has');
import routing = require('./interfaces');
import when = require('dojo/when');
import whenAll = require('dojo/promise/all');

/**
 * The Router module is a base component designed to be extended and used with a path-based routing mechanism, like a
 * URL.
 */
class Router extends ObservableEvented implements routing.IRouter {
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
	 */

	get:routing.IRouterGet;
	set:routing.IRouterSet;
	/**
	 * The app for this router. @protected
	 */
	_app:core.IApplication;

	/**
	 * The routes managed by this router. @protected
	 */
	_routes:{ [key:string]:Route };

	/**
	 * The default route when the application is loaded without an existing route. @protected
	 */
	_defaultRoute:string;

	/**
	 * The route to load when an unmatched route is loaded. @protected
	 */
	_notFoundRoute:string;

	/**
	 * The currently active routes. @protected
	 */
	_activeRoutes:Array<Route>;

	/**
	 * The previous path after a route transition. @protected
	 */
	_oldPath:string;

	constructor(kwArgs?:{ [key:string]: any; }) {
		this._activeRoutes = [];

		super(kwArgs);
	}

	/**
	 * Starts listening for new path changes.
	 */
	startup():IPromise<void> {
		var dfd:IDeferred<void> = new Deferred<void>();
		dfd.resolve(null);
		this._routesSetter = function ():void {};
		this.startup = function ():IPromise<void> { return dfd.promise; };
		this.resume();
		return dfd.promise;
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

		var routes = this.get('routes');
		for (var id in routes) {
			route = routes[id];
			route.destroy && route.destroy();
		}

		this._activeRoutes = this._routes = null;
	}

	/**
	 * Starts the router responding to route changes.
	 */
	resume():void {
		if (has('debug')) {
			throw new Error('Abstract method "resume" not implemented');
		}
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
	 * Transitions to a new route.
	 */
	go(routeId:string, kwArgs:Object):void {
		if (has('debug')) {
			throw new Error('Abstract method "go" not implemented');
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
	 * Creates a unique identifier for the given route.
	 */
	createPath(path:string, kwArgs?:Object):string {
		if (has('debug')) {
			throw new Error('Abstract method "createPath" not implemented');
		}
		return null;
	}

	/**
	 * Normalizes a string to a real ID value.
	 */
	normalizeId(id:string):string {
		// Normalize relative IDs
		var activeRoutes = this._activeRoutes,
			idPrefix = activeRoutes.length ? (activeRoutes[activeRoutes.length - 1].get('path') + '/') : '';

		id = id.replace(/^\.\//, idPrefix);

		if (id === '') {
			id = this.get('defaultRoute');
		}

		if (id.charAt(id.length - 1) === '/') {
			id += this.get('defaultRoute');
		}

		return id;
	}

	/**
	 * Setter for the _routes property.
	 *
	 * @param routeMap A mapping of route IDs to some sort of route descriptor. The descriptor may be a an object, a
	 * string, or a Route. An object descriptor may have the properties `viewModel`, `view`, `code`, or `path`.
	 *
	 * @returns the routeMap
	 */
	_routesSetter(routeMap:{ [id:string]: any }):void {
		var routes = this._routes = {};

		if (!routeMap[this.get('notFoundRoute')]) {
			routeMap[this.get('notFoundRoute')] = { viewModel: null, view: require.toAbsMid('../views/ErrorView'), code: 404 };
		}

		var kwArgs:any,
			defaultRoute:string,
			route:Route;

		for (var routeId in routeMap) {
			kwArgs = routeMap[routeId];

			if (kwArgs instanceof Route) {
				route = kwArgs;
				route.set({
					id: routeId,
					app: this.get('app')
				});
			}
			else {
				if (typeof kwArgs === 'string') {
					kwArgs = { path: kwArgs };
				}

				kwArgs.id = routeId;
				kwArgs.router = this;
				kwArgs.app = this.get('app');

				// Path might be the empty string, and this is OK, but it cannot be null or undefined. Then,
				// because of the way path nesting works, only the last part of the route identifier is used as
				// the default path; the remainder is picked up when the parent relationship is established
				kwArgs.path == null && (kwArgs.path = routeId.replace(/^.*\//, ''));

				route = new Route(kwArgs);
			}

			if (route.get('default')) {
				defaultRoute = routeId;
			}

			routes[routeId] = route;
		}

		if (defaultRoute) {
			this.set('defaultRoute', defaultRoute);
		}

		// TODO: This is a naive, inefficient algorithm that could do with being less awful if someone wants to
		// spend a little time on it
		linkParentRoutes: for (routeId in routes) {
			route = routes[routeId];
			var parentDelimiterIndex = routeId.lastIndexOf('/');

			if (parentDelimiterIndex === -1) {
				// TODO: It feels weird to say the parent of a root route is the app, but it is the easiest way
				// to place views into the main application view
				route.set('parent', this.get('app'));
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

	/**
	 * Activates and deactivates routes in response to a path change.
	 *
	 * @protected
	 *
	 * TODO: Better name for this function?
	 */
	_handlePathChange(newPath:string):void {
		newPath = this.normalizeId(newPath);

		if (newPath === this._oldPath) {
			return;
		}

		var event = new RouteEvent({
				type: 'change',
				cancelable: true,
				pausable: true,
				oldPath: this._oldPath,
				newPath: newPath,
				router: this
			}),
			self = this;

		if (this.emit(event)) {
			// only do this if a listener didn't cancel the change event
			whenAll([
				this._exitRoutes(event),
				this._enterRoutes(event)
			]).then(function ():any {
				function emitIdle():void {
					self.emit(new RouteEvent({
						type: 'idle',
						oldPath: event.oldPath,
						newPath: event.newPath,
						router: self
					}));
				}

				self._oldPath = newPath;

				if (!self._activeRoutes.length) {
					return self._handleNotFoundRoute(event).then(emitIdle);
				}
				else {
					emitIdle();
				}
			});
		}
	}

	/**
	 * Exits active routes that do not match the new path given in `event`.
	 */
	_exitRoutes(event:RouteEvent):void {
		var activeRoutes = this._activeRoutes;

		for (var i = activeRoutes.length - 1, route:Route; (route = activeRoutes[i]); --i) {
			if (!route.test(event.newPath)) {
				route.exit();
				activeRoutes.splice(i, 1);
			}
		}
	}

	/**
	 * Enters routes that match the new path given in `event`.
	 *
	 * @returns A promise that is resolved once all matching routes have finished activating.
	 */
	_enterRoutes(event:RouteEvent):IPromise<any> {
		var startups:IPromise<Route>[] = [],
			route:Route;

		var routes = this.get('routes');
		for (var id in routes) {
			route = routes[id];
			if (route.test(event.newPath)) {
				startups.push(route.startup());

				if (array.indexOf(this._activeRoutes, route) === -1) {
					this._activeRoutes.push(route);
				}
			}
		}

		return whenAll(startups).then((routes:Route[]):void => {
			for (var i = 0; i < routes.length; i++) {
				routes[i].enter(event);
			}
		});
	}

	/**
	 * Handles not found routes by activating the not-found route.
	 */
	_handleNotFoundRoute(event:RouteEvent):IPromise<any> {
		var notFoundRoute = this.get('routes')[this.get('notFoundRoute')];
		this._activeRoutes.push(notFoundRoute);
		return when(notFoundRoute.enter(event));
	}
}

Router.defaults({
	defaultRoute: 'index',
	notFoundRoute: 'error'
});

export = Router;

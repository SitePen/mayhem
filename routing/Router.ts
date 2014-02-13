import Deferred = require('dojo/Deferred');
import ObservableEvented = require('../ObservableEvented');
import Route = require('./Route');
import RouteEvent = require('./RouteEvent');
import array = require('dojo/_base/array');
import core = require('../interfaces');
import has = require('../has');
import lang = require('dojo/_base/lang');
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
	 * See `framework/routing/Route` for more information on available Route properties. By default, Router will set the
	 * `path`, `view`, and `controller` properties to the ID of the route if they are not explicitly set.
	 *
	 * For the moment, routes must only be set after the `controllerPath`, `viewPath`, and `templatePath` have been set
	 * to their correct values.
	 *
	 * Once the router has been started, routes can no longer be changed.
	 */

	/** The routes managed by this router */
	_routes:{ [key:string]: routing.IRoute };

	/** The app for this router @protected */
	private _app:core.IApplication;

	/** The default location for controllers. @protected */
	private _controllerPath:string = 'app/controllers';

	/** The default location for views. @protected */
	private _viewPath:string = 'app/views';

	/** The default location for templates. @protected */
	private _templatePath:string = '../template!app/views';

	/** The default route when the application is loaded without an existing route. @protected */
	private _defaultRoute:string = 'index';

	/** The route to load when an unmatched route is loaded. @protected */
	private _notFoundRoute:string = 'error';

	/** @protected */
	_oldPath:string;

	/** @protected */
	_activeRoutes:Array<routing.IRoute> = [];

	_routesSetter(routeMap:{ [id:string]: { view:string; code:number }}):{ [key:string]: { view:string; code:number } } {
		var routes = this._routes = {},
			routeArray = [];

		if (!routeMap[this._notFoundRoute]) {
			routeMap[this._notFoundRoute] = { controller: null, view: '/framework/views/ErrorView', code: 404 };
		}

		var kwArgs,
			route;
		for (var routeId in routeMap) {
			kwArgs = routeMap[routeId];

			if (kwArgs.isInstanceOf ? kwArgs.isInstanceOf(Route) : kwArgs instanceof Route) {
				route = kwArgs;
				route.set({
					id: routeId,
					app: this._app
				});
			}
			else {
				if (typeof kwArgs === 'string') {
					kwArgs = { path: kwArgs };
				}

				kwArgs.id = routeId;
				kwArgs.router = this;
				kwArgs.app = this._app;

				// Path might be the empty string, and this is OK, but it cannot be null or undefined. Then,
				// because of the way path nesting works, only the last part of the route identifier is used as
				// the default path; the remainder is picked up when the parent relationship is established
				kwArgs.path == null && (kwArgs.path = routeId.replace(/^.*\//, ''));

				this._fixUpRouteArguments(kwArgs);
				route = new Route(kwArgs);
			}

			routes[routeId] = route;
			routeArray.push(route);
		}

		// TODO: This is a naive, inefficient algorithm that could do with being less awful if someone wants to
		// spend a little time on it
		linkParentRoutes: for (var i = 0; (route = routeArray[i]); ++i) {
			var parentDelimiterIndex = route.id.lastIndexOf('/');
			if (parentDelimiterIndex === -1) {
				// TODO: It feels weird to say the parent of a root route is the app, but it is the easiest way
				// to place views into the main application view
				route.set('parent', this._app);
				continue;
			}

			var parentRouteId = route.id.slice(0, parentDelimiterIndex);
			for (var j = 0, parentRoute; (parentRoute = routeArray[j]); ++j) {
				if (parentRoute.id === parentRouteId) {
					route.set({
						parent: parentRoute,
						path: parentRoute.path + '/' + route.path
					});
					continue linkParentRoutes;
				}
			}

			throw new Error('Could not find a parent route for ' + route.id);
		}

		return routeMap;
	}

	/**
	 * Transforms route view/template/controller arguments to complete module IDs. Directly modifies the passed object.
	 */
	_fixUpRouteArguments(kwArgs:{ id: string; [key:string]: any }):void {
		/**
		 * Converts a shorthand reference to a valid constructor-style module ID. e.g. `foo -> Foo`, `foo/bar ->
		 * foo/Bar`
		 */
		function resolve(value:string):string {
			return value.replace(/(^|\/)([a-z])([^\/]*)$/, function () {
				return arguments[1] + arguments[2].toUpperCase() + arguments[3];
			});
		}

		var suffixes = {
			view: 'View',
			template: 'View.html',
			controller: 'Controller'
		};

		var routeId = kwArgs.id,
			resolvedRouteId = resolve(routeId);

		for (var key in { controller: 1, view: 1, template: 1 }) {
			var value = kwArgs[key];

			// undefined controller and template default to computing the ID based on the route ID
			if (value === undefined && key !== 'view') {
				kwArgs[key] = this.get(key + 'Path').replace(/\/*$/, '/') + resolvedRouteId + suffixes[key];
			}
			// undefined view, or null values for any property, default to a generic component ID
			else if (value == null) {
				kwArgs[key] = 'framework/' + suffixes[key];
			}
			// values starting with a forward-slash are treated as pre-computed IDs
			else if (value.charAt(0) === '/') {
				kwArgs[key] = value.slice(1);
			}
			// all other values are transformed into an absolute module ID using the value as-is
			else {
				kwArgs[key] = this.get(key + 'Path').replace(/\/*$/, '/') + resolve(value) + suffixes[key];
			}
		}
	}

	/**
	 * Starts listening for new path changes.
	 */
	startup():IPromise<void> {
		// prevent routes from being modified once the router is started
		this._routesSetter = function () { return null; }
		this.startup = function () { return null; };
		this.resume();
		return null;
	}

	/**
	 * Stops listening for any new path changes, exits all active routes, and destroys all registered routes.
	 */
	destroy():void {
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
			id = this._defaultRoute;
		}

		if (id.charAt(id.length - 1) === '/') {
			id += this._defaultRoute;
		}

		return id;
	}

	/**
	 * Activates and deactivates routes in response to a path change.
	 */
	_handlePathChange(newPath:string):void {
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

		if (this.emit('change', event)) {
			whenAll([
				this._exitRoutes(event),
				this._enterRoutes(event)
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
	}

	/**
	 * Exits active routes that do not match the new path given in `event`.
	 *
	 * @returns A promise that is resolved once all matching routes have finished deactivating.
	 */
	_exitRoutes(event:RouteEvent):IPromise<any> {
		var activeRoutes = this._activeRoutes,
			exits = [];

		for (var i = activeRoutes.length - 1, route; (route = activeRoutes[i]); --i) {
			if (!route.test(event.newPath)) {
				exits.push(route.exit(event));
				activeRoutes.splice(i, 1);
			}
		}

		return whenAll(exits);
	}

	/**
	 * Enters routes that match the new path given in `event`.
	 *
	 * @returns A promise that is resolved once all matching routes have finished activating.
	 */
	_enterRoutes(event:RouteEvent):IPromise<any> {
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
	}

	/**
	 * Handles not found routes by activating the not-found route.
	 */
	_handleNotFoundRoute(event:RouteEvent):IPromise<any> {
		var notFoundRoute = this._routes[this._notFoundRoute];
		this._activeRoutes.push(notFoundRoute);
		return when(notFoundRoute.enter(event));
	}
}

export = Router;

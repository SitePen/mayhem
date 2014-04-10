/// <reference path="../dojo" />

import Deferred = require('dojo/Deferred');
import BaseRoute = require('./BaseRoute');
import RouteEvent = require('./RouteEvent');
import core = require('../interfaces');
import has = require('../has');
import lang = require('dojo/_base/lang');
import routing = require('./interfaces');
import when = require('dojo/when');

/**
 * A Route is a BaseRoute that binds a Controller and View to a particular route.
 */
class Route extends BaseRoute implements routing.IRoute {
	private _subViewHandles:Array<{ remove:() => void}> = [];
	private _controllerInstance:any /* framework/Controller */;
	private _viewInstance:any /* ui.IContentView */;

	/**
	 * The unique identifier for this route.
	 */
	_id:string;

	/**
	 * The parent route of this route. If no parent route exists, parent will be set to the main Application instance.
	 */
	_parent:any /*routing.IRoute, core.IApplication*/;

	/**
	 * The name of a controller which, when transformed using the expression `router.controllerPath + '/' +
	 * toUpperCamelCase(route.controller) + 'Controller'`, provides a module ID that points to a module whose value is a
	 * `framework/Controller`. If the string starts with a `/`, it will be treated as an absolute module ID and not
	 * transformed. If null, a generic Controller object will be used for this route instead.
	 */
	_mediator:string;

	/**
	 * The name of a view which, when transformed using the expression `router.viewPath + '/' +
	 * toUpperCamelCase(route.view) + 'View'`, provides a module ID that points to a module whose value is a
	 * `ui.IView`. If the string starts with a `/`, it will be treated as an absolute module ID and not
	 * transformed. If null, a generic View object will be used for this route instead.
	 */
	_view:string;

	/**
	 * The name of a template which, when transformed using the expression `router.viewPath + '/' +
	 * toUpperCamelCase(route.template) + 'View.html'`, provides a path to a Mayhem template. If the string starts with
	 * a '/', it will be treated as an absolute path and not transformed.
	 */
	_template:string;

	/**
	 * The ID of the placeholder in the parent route's view that this route's view should be injected into.
	 */
	_placeholder:string;

	/**
	 * The router to which this route belongs.
	 */
	_router:routing.IRouter;

	/**
	 * @protected
	 */
	_app:core.IApplication;

	/**
	 * Activates this route, instantiating view and controller components and placing them into any parent route's view.
	 * Whenever a route is activated, state information from the route is provided to the controller by setting its
	 * `routeState` property.
	 */
	enter(event:RouteEvent):IPromise<void> {
		var id = this.get('id'),
			setRouteState = (event:RouteEvent):IPromise<void> => {
				this._subViewHandles.push(this.get('parent').place(this._viewInstance, this.get('placeholder')));

				has('debug') && console.log('entering', id);

				var kwArgs = { id: id };

				for (var k in this) {
					// Custom properties on the route should be provided to the controller, but not private or default
					// properties since those are only relevant to the route itself
					// TODO: is !this.hasOwnProperty(k) equivalent to (k in this.constructor.prototype)?
					if (k.charAt(0) === '_' || !this.hasOwnProperty(k)) {
						continue;
					}

					kwArgs[k] = this[k];
				}

				lang.mixin(kwArgs, this.parse(event.newPath));

				has('debug') && console.log('new route state for', id, kwArgs);
				this._controllerInstance.set('routeState', kwArgs);
				return dfd.promise;
			};

		has('debug') && console.log('preparing', id);

		var self = this,
			dfd:IDeferred<void> = new Deferred<void>();

		require([
			this.get('view'),
			this.get('mediator')
		], function (View:any, Controller:any, TemplateConstructor:any):void {
			when(self._instantiateComponents(View, Controller)).then(function ():void {
				setRouteState(event);
				dfd.resolve(null);
			}, function ():void {
				dfd.reject(null);
			});
		});

		this.enter = setRouteState;

		return dfd.promise;
	}

	/**
	 * Deactivates the route, disconnecting any subviews within the route's view and removing the view from its parent.
	 */
	exit():void {
		has('debug') && console.log('exiting', this.get('id'));

		var handle:IHandle;
		while ((handle = this._subViewHandles.pop())) {
			handle.remove();
		}
	}

	/**
	 * Destroy the view and controller associated with this route.
	 */
	destroy():void {
		if (this._viewInstance) {
			this._viewInstance.destroyRecursive();
			this._controllerInstance.destroy && this._controllerInstance.destroy();
		}
	}

	/**
	 * Places a sub-view into the view for this route at the placeholder given in `placeholderId`.
	 *
	 * @param view - The sub-view to place.
	 * @param placeholderId - The placeholder in which it should be placed. If not provided, defaults to `default`.
	 */
	place(view:any /* ui.IContentView */, placeholderId?:string):IHandle {
		return this._viewInstance.add(view, placeholderId);
	}

	/**
	 * Instantiate the view and controller components this route manages.
	 * @protected
	 */
	_instantiateComponents(View:any, Controller:any):void {
		var controller = this._controllerInstance = new Controller({
			app: this.get('app')
		});

		this._viewInstance = new View({
			app: this.get('app'),
			mediator: controller
		});

		return this._viewInstance;
	}
}

// Default primitive property values
Route.defaults({
	placeholder: 'default'
});

export = Route;

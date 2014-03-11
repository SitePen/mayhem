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
	/** The unique identifier for this route. */
	private _id:string;

	/**
	 * The parent route of this route. If no parent route exists, parent will be set to the main Application instance.
	 */
	private _parent:any /*routing.IRoute, core.IApplication*/;

	/**
	 * The name of a controller which, when transformed using the expression `router.controllerPath + '/' +
	 * toUpperCamelCase(route.controller) + 'Controller'`, provides a module ID that points to a module whose value is a
	 * `framework/Controller`. If the string starts with a `/`, it will be treated as an absolute module ID and not
	 * transformed. If null, a generic Controller object will be used for this route instead.
	 */
	private _controller:string;

	/**
	 * The name of a view which, when transformed using the expression `router.viewPath + '/' +
	 * toUpperCamelCase(route.view) + 'View'`, provides a module ID that points to a module whose value is a
	 * `ui.IView`. If the string starts with a `/`, it will be treated as an absolute module ID and not
	 * transformed. If null, a generic View object will be used for this route instead.
	 */
	private _view:string;

	/**
	 * The name of a template which, when transformed using the expression `router.viewPath + '/' +
	 * toUpperCamelCase(route.template) + 'View.html'`, provides a path to a Mayhem template. If the string starts with
	 * a '/', it will be treated as an absolute path and not transformed.
	 */
	private _template:string;

	/** The ID of the placeholder in the parent route's view that this route's view should be injected into. */
	private _placeholder:string;

	/** The router to which this route belongs. */
	private _router:routing.IRouter;

	private _subViewHandles:Array<{ remove:() => void}> = [];
	private _controllerInstance:any /* framework/Controller */;
	private _viewInstance:any /* ui.IView */;

	/** @protected */
	_app:core.IApplication;

	/**
	 * Activates this route, instantiating view and controller components and placing them into any parent route's view.
	 * Whenever a route is activated, state information from the route is provided to the controller by setting its
	 * `routeState` property.
	 */
	enter(event:RouteEvent):IPromise<void> {
		function setRouteState(event:RouteEvent):IPromise<void> {
			has('debug') && console.log('entering', self._id);

			var kwArgs = { id: self._id };

			for (var k in self) {
				// Custom properties on the route should be provided to the controller, but not private or default
				// properties since those are only relevant to the route itself
				// TODO: is !self.hasOwnProperty(k) equivalent to (k in self.constructor.prototype)?
				if (k.charAt(0) === '_' || (!self.hasOwnProperty(k))) {
					continue;
				}

				kwArgs[k] = self[k];
			}

			lang.mixin(kwArgs, self.parse(event.newPath));

			has('debug') && console.log('new route state for', self._id, kwArgs);
			self._controllerInstance.set('routeState', kwArgs);
			return dfd.promise;
		}

		has('debug') && console.log('preparing', this._id);

		var self = this,
			dfd:IDeferred<void> = new Deferred<void>();

		require([
			this._view,
			this._controller,
			this._template
		], function (View:any, Controller:any, TemplateConstructor:any) {
			return when(self._instantiateComponents(View, Controller, TemplateConstructor)).then(function () {
				setRouteState(event);
				dfd.resolve(null);
			}, function () {
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
		has('debug') && console.log('exiting', this._id);

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
	place(view:any /* ui.IView */, placeholderId?:string) {
		return this._viewInstance.addSubView(view, placeholderId);
	}

	/**
	 * Instantiate the view and controller components this route manages.
     *
	 * @protected
	 */
	_instantiateComponents(View:any, Controller:any, TemplateConstructor:any):void {
		var controller = this._controllerInstance = new Controller({
			app: this._app
		});

		this._viewInstance = new View({
			app: this._app,
			TemplateConstructor: TemplateConstructor,
			viewModel: controller
		});

		this._subViewHandles.push(this._parent.place(this._viewInstance, this._placeholder));

		return this._viewInstance.startup();
	}
}

// Default primitive property values
lang.mixin(Route.prototype, {
	_placeholder: 'default'
});

export = Route;

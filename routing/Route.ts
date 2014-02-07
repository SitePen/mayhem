import routing = require('./interfaces');
import widgets = require('../ui/interfaces');
import BaseRoute = require('./BaseRoute');
import RouteEvent = require('./RouteEvent');
import Deferred = require('dojo/Deferred');
import lang = require('dojo/_base/lang');
import has = require('../has');
import when = require('dojo/when');

// TODO: Rename BaseRoute to Route and rename this guy to PathRoute or something?

class Route extends BaseRoute {
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
	 * `framework/View`. If the string starts with a `/`, it will be treated as an absolute module ID and not
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
	private _placeholder:string = 'default';

	/** The router to which this route belongs. */
	private _router:routing.IRouter;

	get(key:'id'):string;
	get(key:'parent'):any;
	get(key:'controller'):string;
	get(key:'view'):string;
	get(key:'template'):string;
	get(key:'placeholder'):string;
	get(key:'router'):routing.IRouter;
	get(key:string):any;
	get(key:string):any {
		return this['_' + key];
	}

	set(key:'id', value:string):void;
	set(key:'parent', value:string):void;
	set(key:'controller', value:string):void;
	set(key:'view', value:string):void;
	set(key:'template', value:string):void;
	set(key:'placeholder', value:string):void;
	set(key:'router', value:routing.IRouter):void;
	set(key:string, value:any):void;
	set(key:Object):void;
	set(key:string, value?:any):void {
		this['_' + key] = value;
	}

	private _subViewHandles:Array<{ remove:() => void}>;
	private _controllerInstance;
	private _viewInstance;

	constructor(kwArgs?:{ [key:string]: any }) {
		super();
		this._subViewHandles = [];
	}

	/**
	 * Activates this route, instantiating view and controller components and placing them into any parent route's view.
	 * Whenever a route is activated, state information from the route is provided to the controller by setting its
	 * `routeState` property.
	 */
	enter(event:RouteEvent):IPromise<void> {
		function setRouteState(event) {
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
			dfd = new Deferred<void>();

		require([
			this._view,
			this._controller,
			this._template
		], function (View, Controller, TemplateConstructor) {
			return when(self._instantiateComponents(View, Controller, TemplateConstructor)).then(function () {
				setRouteState(event);
				dfd.resolve();
			}, function () {
				dfd.reject();
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

		var handle;
		while ((handle = this._subViewHandles.pop())) {
			handle.remove();
		}
	}

	destroy():void {
		// TODO: is this necessary?
		//super.destroy();

		if (this._viewInstance) {
			this._viewInstance.destroyRecursive();
			this._controllerInstance.destroy && this._controllerInstance.destroy();
		}
	}

	/**
	 * Places a sub-view into the view for this route at the placeholder given in `placeholderId`.
	 *
	 * @param view
	 * The sub-view to place.
	 *
	 * @param placeholderId
	 * The placeholder in which it should be placed. If not provided, defaults to `default`.
	 */
	// TODO: view should be an IView
	place(view, placeholderId?:string) {
		return this._viewInstance.addSubView(view, placeholderId);
	}

	/* protected */ _instantiateComponents(View, Controller, TemplateConstructor):void {
		var controller = this._controllerInstance = new Controller({
			app: this.get('app')
		});

		this._viewInstance = new View({
			app: this.get('app'),
			TemplateConstructor: TemplateConstructor,
			viewModel: controller
		});

		this._subViewHandles.push(this._parent.place(this._viewInstance, this._placeholder));

		return this._viewInstance.startup();
	}
}

export = Route;

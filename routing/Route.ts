/// <reference path="../dojo" />

import all = require('dojo/promise/all');
import array = require('dojo/_base/array');
import BaseRoute = require('./BaseRoute');
import core = require('../interfaces');
import Deferred = require('dojo/Deferred');
import has = require('../has');
import lang = require('dojo/_base/lang');
import Mediator = require('../data/Mediator');
import RouteEvent = require('./RouteEvent');
import routing = require('./interfaces');
import ui = require('framework/ui/interfaces');
import util = require('framework/util');
import when = require('dojo/when');

/**
 * A Route is a BaseRoute that binds a Controller to a particular route.
 */
class Route extends BaseRoute implements routing.IRoute {
	private _subViewHandles:Array<{ remove:() => void}> = [];
	private _controllerInstance:any /* framework/Controller */;

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
	_controller:string;
	_controllerFor:string;

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
	enter(event:RouteEvent):void {
		var id = this.get('id');

		if (!this._controllerFor) {
			this._subViewHandles.push(this.get('parent').place(this._controllerInstance, this.get('placeholder')));
		}

		has('debug') && console.log('entering', id);

		var kwArgs = { id: id };

		for (var k in this) {
			// Custom properties on the route should be provided to the controller, but not private or default
			// properties since those are only relevant to the route itself
			// TODO: is !this.hasOwnProperty(k) equivalent to (k in this.constructor.prototype)?
			if (k.charAt(0) === '_' || !this.hasOwnProperty(k) || k === 'startup') {
				continue;
			}

			kwArgs[k] = this[k];
		}

		lang.mixin(kwArgs, this.parse(event.newPath));

		has('debug') && console.log('new route state for', id, kwArgs);
		this._controllerInstance.set('routeState', kwArgs);
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

		this._controllerInstance.set('routeState', null);
	}

	/**
	 * Destroy the controller associated with this route.
	 */
	destroy():void {
		if (this._controllerInstance) {
			when(this._controllerInstance).then((controller:any):void => {
				controller.destroy();
				this._controllerInstance = null;
			});
		}
	}

	/**
	 * Places a sub-view into the view for this route at the placeholder given in `placeholderId`.
	 *
	 * @param view - The sub-view to place.
	 * @param placeholderId - The placeholder in which it should be placed. If not provided, defaults to `default`.
	 */
	place(controller:any /* ui.IContentView */, placeholderId?:string):IPromise<IHandle> {
		return this._controllerInstance.add(controller, placeholderId);
	}

	startup():IPromise<Route> {
		has('debug') && console.log('preparing', this.get('id'));

		var dfd = new Deferred<Route>(),
			controllerDfd = new Deferred<any>();

		this._controllerInstance = controllerDfd.promise.then((controller:any):void => {
			this._controllerInstance = controller;
			dfd.resolve(this);
		}).otherwise((error:any):void => {
			dfd.reject(error);
		});

		if (this._controllerFor) {
			this.get('router').get('routes')[this._controllerFor]._controllerInstance.then(controllerDfd.resolve, controllerDfd.reject);
		}
		else {
			require([
				this.get('controller')
			], (Controller:any):void => {
				try {
					var controller = this._controllerInstance = new Controller({
						id: this.get('id'),
						app: this.get('app'),
						modules: this.get('modules')
					});
					controller.startup().then(controllerDfd.resolve, controllerDfd.reject);
				}
				catch (e) {
					controllerDfd.reject(e);
				}
			});
		}

		this.startup = ():IPromise<Route> => dfd.promise;

		return dfd.promise;
	}

	/**
	 * Instantiate the view and mediator components this route manages.
	 * @protected
	 */
	_instantiateComponents(Controller:any):any {
		return this._controllerInstance = new Controller({
			app: this.get('app'),
			parent: this.get('parent').get('controllerInstance')
		});
	}
}

// Default primitive property values
Route.defaults({
	placeholder: 'default'
});

export = Route;

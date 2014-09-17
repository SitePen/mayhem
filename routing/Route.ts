/// <reference path="../dojo" />

import BaseRoute = require('./BaseRoute');
import has = require('../has');
import lang = require('dojo/_base/lang');
import Promise = require('../Promise');
import RouteEvent = require('./RouteEvent');
import routing = require('./interfaces');
import util = require('../util');
import View = require('../ui/View');
import WebApplication = require('../WebApplication');

/**
 * A Route is a BaseRoute that binds a view and view model to a particular route.
 */
class Route extends BaseRoute implements routing.IRoute {
	/**
	 * @protected
	 */
	_app:WebApplication;

	/**
	 * The unique identifier for this route.
	 */
	_id:string;

	/**
	 * @protected
	 */
	_model:Object;

	/**
	 * The parent route of this route.
	 */
	_parent:Route;

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
	_view:View;

	get:Route.Getters;
	set:Route.Setters;

	/**
	 * Whenever a route is activated, state information from the route is provided to the view’s model by setting its
	 * `routeState` property.
	 */
	enter(event:RouteEvent):void {
		var id:string = this._id;
		var parentRoute:Route = this._parent;
		var parentView:View = parentRoute ? parentRoute.get('view') : this._app.get('ui').get('view');

		parentView.set(this._placeholder, this._view);

		has('debug') && console.debug('entering', id);

		var kwArgs:any = { id: id };

		for (var k in this) {
			// Custom properties on the route should be provided to the model, but not private or default
			// properties since those are only relevant to the route itself
			if (k.charAt(0) === '_' || !this.hasOwnProperty(k) || k === 'startup') {
				continue;
			}

			kwArgs[k] = this[k];
		}

		// TODO: Is there other data that should always be exposed from the route? Maybe the entire event?
		kwArgs.path = event.newPath;
		lang.mixin(kwArgs, this.parse(event.newPath));

		has('debug') && console.debug('new route state for', id, kwArgs);

		// TODO: Constrain model to IModel?
		var model:any = this._model;
		if (model) {
			if (model.set) {
				model.set('routeState', kwArgs);
			}
			else {
				model.routeState = kwArgs;
			}
		}

		if (this._parent) {
			this._parent.get('view').set(this._placeholder, this._view);
		}
	}

	/**
	 * Deactivates the route, disconnecting any subviews within the route's view and removing the view from its parent.
	 */
	exit():void {
		has('debug') && console.debug('exiting', this._id);
	}

	destroy():void {
		this._view && this._view.destroy && this._view.destroy();
		this._model && this._model['destroy'] && this._model['destroy']();
		this._view = this._model = null;
		super.destroy();
	}

	startup():IPromise<void> {
		has('debug') && console.debug('preparing', this._id);

		var self = this;
		var promises:Promise<void>[] = [];

		if (typeof this._view === 'string') {
			promises.push(util.getModule(<any> this._view).then(function (Ctor:typeof View):void {
				self._view = new Ctor({
					app: self._app
				});
			}));
		}

		if (typeof this._model === 'string') {
			// TODO: Fix Ctor type
			promises.push(util.getModule(<any> this._model).then(function (Ctor:{ new (kwArgs?:Object):any; }):void {
				self._model = new Ctor({
					app: self._app
				});
			}));
		}

		var promise:Promise<void> = Promise.all(promises).then(function ():void {});

		this.startup = function ():IPromise<void> {
			return promise;
		};

		return promise;
	}
}

Route.prototype._placeholder = 'default';

module Route {
	export interface Getters extends BaseRoute.Getters, routing.IRoute.Getters {
		(key:'app'):WebApplication;
		(key:'id'):string;
		(key:'model'):Object;
		(key:'parent'):Route;
		(key:'placeholder'):string;
		(key:'view'):View;
	}
	export interface Setters extends BaseRoute.Setters, routing.IRoute.Setters {
		(key:'model', value:Object):void;
		(key:'parent', value:Route):void;
		(key:'placeholder', value:string):void;
		(key:'view', value:View):void;
	}
}

export = Route;

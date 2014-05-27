/// <reference path="../dojo" />

import all = require('dojo/promise/all');
import array = require('dojo/_base/array');
import BaseRoute = require('./BaseRoute');
import core = require('../interfaces');
import Deferred = require('dojo/Deferred');
import has = require('../has');
import lang = require('dojo/_base/lang');
import RouteEvent = require('./RouteEvent');
import routing = require('./interfaces');
import ui = require('../ui/interfaces');
import util = require('../util');
import when = require('dojo/when');

function resolve(value:string):string {
	return value.replace(/(^|\/)([a-z])([^\/]*)$/, function ():string {
		return arguments[1] + arguments[2].toUpperCase() + arguments[3];
	});
}

/**
 * A Route is a BaseRoute that binds a view and view model to a particular route.
 */
class Route extends BaseRoute implements routing.IRoute {
	private _subViewHandles:Array<{ remove:() => void}>;

	/**
	 * The unique identifier for this route.
	 */
	_id:string;

	/**
	 * The parent route of this route. If no parent route exists, parent will be set to the main Application instance.
	 */
	_parent:any /*routing.IRoute, core.IApplication*/;

	_model:any;
	_resolvedId:string;
	_resolvedPath:string;
	_template:string;
	_view:any;
	_viewInstance:any;
	_viewModel:any;
	_viewModelInstance:any;

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

	constructor(kwArgs:any = {}) {
		var newKwArgs = {
			id: kwArgs.id,
			app: kwArgs.app,
			router: kwArgs.router
		};
		lang.mixin(newKwArgs, kwArgs);

		this._subViewHandles = [];
		super(newKwArgs);
	}

	_idSetter(id:string):void {
		this._id = id;
		this._resolvedId = resolve(id);
		this._resolvedPath = this._resolvedId.substring(0, this._resolvedId.lastIndexOf('/') + 1);
	}

	_modelGetter():string {
		if (this._model === false || typeof this._model === 'function') {
			return this._model;
		}
		return this.get('modelPath').replace(/\/*$/, '/') + this._model;
	}

	_resolveModuleId(path:string, value:any):string {
		if (!value && value != null) {
			return;
		}

		path = path.replace(/\/*$/, '/');
		if (!value) {
			value = path + this._resolvedId;
		}
		else {
			path = path + this._resolvedPath;
			if (value.charAt(0) !== '.') {
				if (value.indexOf('/') === -1) {
					value = path + './' + value;
				}
			}
			else {
				value = path + value;
			}
		}

		return require.toAbsMid(value);
	}

	_viewGetter():string {
		var key:string,
			value:string;
		if (this._template || !this._view) {
			key = 'template';
			value = this._template;
		}
		else {
			key = 'view';
			value = this._view;
		}

		if (typeof value === 'function') {
			return value;
		}

		value = this._resolveModuleId(this.get(key + 'Path'), value);

		if (key === 'template') {
			value = this.get('templatePlugin') + '!' + value;

			if (value.slice(-5) !== '.html') {
				value += '.html';
			}
		}

		return value;
	}

	_viewModelGetter():string {
		if (!this._viewModel || typeof this._viewModel === 'string') {
			return this._resolveModuleId(this.get('viewModelPath'), this._viewModel);
		}
		return this._viewModel;
	}

	/**
	 * Places a sub-view into the view for this route at the placeholder given in `placeholderId`.
	 *
	 * @param view - The sub-view to place.
	 * @param placeholderId - The placeholder in which it should be placed. If not provided, defaults to `default`.
	 */
	add(view:any, placeholderId?:string):IHandle {
		return this._viewInstance.add(view, placeholderId);
	}

	/**
	 * Activates this route, instantiating view and viewModel components and placing them into any parent route's view.
	 * Whenever a route is activated, state information from the route is provided to the viewModel by setting its
	 * `routeState` property.
	 */
	enter(event:RouteEvent):void {
		var id = this.get('id');

		this._subViewHandles.push(this.get('parent').add(this._viewInstance, this.get('placeholder')));

		has('debug') && console.log('entering', id);

		var kwArgs = { id: id };

		for (var k in this) {
			// Custom properties on the route should be provided to the viewModel, but not private or default
			// properties since those are only relevant to the route itself
			// TODO: is !this.hasOwnProperty(k) equivalent to (k in this.constructor.prototype)?
			if (k.charAt(0) === '_' || !this.hasOwnProperty(k) || k === 'startup') {
				continue;
			}

			kwArgs[k] = this[k];
		}

		lang.mixin(kwArgs, this.parse(event.newPath));

		has('debug') && console.log('new route state for', id, kwArgs);
		this._viewModelInstance.set('routeState', kwArgs);
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

		this._viewModelInstance.set('routeState', null);
	}

	/**
	 * Destroy the view and viewModel associated with this route.
	 */
	destroy():void {
		if (this._viewInstance) {
			when(this._viewInstance).then((view:any):void => {
				view.destroy();
				this._viewModel.destroy();
				this._view = this._viewModel = null;
			});
		}
	}

	startup():IPromise<Route> {
		has('debug') && console.log('preparing', this.get('id'));

		var view:any = this.get('view'),
			viewModel:any = this.get('viewModel'),
			model:any = this.get('model');

		// TODO: There has to be a better way to do this
		view = typeof view === 'string' ? util.getModule(view) : view;
		viewModel = typeof viewModel === 'string' ? util.getModule(viewModel) : viewModel;
		model = typeof model === 'string' ? util.getModule(model) : model;

		this._viewInstance = util.spread([view, viewModel, model], (View:any, ViewModel:any, Store:any):any => {
			if (typeof ViewModel === 'function') {
				this._viewModelInstance = new ViewModel({
					app: this.get('app'),
					store: Store
				});
			}
			else {
				this._viewModelInstance = ViewModel;
			}
			var view:any = this._viewInstance = new View({
				app: this.get('app'),
				model: this._viewModelInstance
			});
			return view;
		});

		var promise:IPromise<Route> = this._viewInstance.then(():any => this);

		this.startup = ():IPromise<Route> => promise;

		return promise;
	}
}

util.applicationGetters(Route, [
	'modelPath', 'storePath', 'templatePath',
	'templatePlugin', 'viewPath', 'viewModelPath'
]);

// Default primitive property values
Route.defaults({
	placeholder: 'default'
});

export = Route;

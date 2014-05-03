import aspect = require('dojo/aspect');
import BaseController = require('./BaseController');
import lang = require('dojo/_base/lang');
import util = require('../util');
import whenAll = require('dojo/promise/all');

class Controller extends BaseController {
	private _actions:{ [key:string]:Function; };
	private _viewActionHandle:IHandle;

	static actions(actionHandlers:any):void {
		var proto = this.prototype,
			actions:any = proto._actions;

		if (!actions) {
			proto._actions = actions = {};
		}
		else if (!proto.hasOwnProperty('_actions')) {
			proto._actions = actions = lang.delegate(proto._actions);
		}

		// TODO: should we call stopProgation on events passed to action handlers automatically?
		for (var key in actionHandlers) {
			aspect.after(actions, key, actionHandlers[key], true);
		}
	}

	_loadModule(key:string, config:any, modules:any):IPromise<any> {
		if (key !== 'store') {
			return super._loadModule(key, config, modules);
		}

		var stores:{ [key:string]:IPromise<dstore.ICollection<any>> } = {},
			manager = this.get('app').get('stores');
		if (typeof config === 'string') {
			modules[key] = config = { store: config };
		}

		for (var id in config) {
			stores[id] = manager.getStore(config[id]);
		}

		return whenAll(stores);
	}

	_instantiateModules(modules:any):void {
		// ensure stores are setup before anything else
		var store:{ [key:string]:dstore.ICollection<any>; } = modules.store;
		if (store) {
			for (var key in store) {
				this.set(key, store[key]);
			}
			// since the manager handles instantiation, null this out
			// so the controller mechanism doesn't try to do it
			modules.store = null;
		}

		super._instantiateModules(modules);
	}

	_modelSetter(value:any):void {
		if (value && typeof value.then === 'function') {
			value.then((value:any):void => this.set('model', value));
			return;
		}

		this['_model'] = value;
		this.get('viewModel').set('model', value);
	}

	_viewChanged(view:any):void {
		if (this._viewActionHandle) {
			this._viewActionHandle.remove();
			this._viewActionHandle = null;
		}
		if (!view) {
			return;
		}

		var handles:IHandle[] = [];
		for (var key in this._actions) {
			handles.push(
				view.on(key, lang.hitch(this, this._actions[key]))
			);
		}

		this._viewActionHandle = {
			remove: function ():void {
				this.remove = function ():void {};
				for (var i = 0; i < handles.length; i++) {
					handles[i].remove();
				}
				handles = view = null;
			}
		};
	}

	_viewSetter(view:any):void {
		this['_view'] = view;

		var viewModel:any = this.get('viewModel');
		if (viewModel) {
			view.set('model', viewModel);
		}
	}

	_viewModelSetter(viewModel:any):void {
		this['_viewModel'] = viewModel;

		var view:any = this.get('view');
		if (view) {
			view.set('model', viewModel);
		}
	}
}

export = Controller;

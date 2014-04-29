import BaseController = require('./BaseController');
import util = require('../util');
import whenAll = require('dojo/promise/all');

class Controller extends BaseController {
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

	_viewSetter(value:any):void {
		this['_view'] = value;

		var viewModel:any = this.get('viewModel');
		if (viewModel) {
			value.set('mediator', viewModel);
		}
	}

	_viewModelSetter(value:any):void {
		this['_viewModel'] = value;

		var view:any = this.get('view');
		if (view) {
			view.set('mediator', value);
		}
	}
}

export = Controller;

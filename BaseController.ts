import array = require('dojo/_base/array');
import core = require('./interfaces');
import Deferred = require('dojo/Deferred');
import has = require('./has');
import lang = require('dojo/_base/lang');
import ObservableEvented = require('./ObservableEvented');
import requestUtil = require('dojo/request/util');
import util = require('./util');
import whenAll = require('dojo/promise/all');

class Controller extends ObservableEvented {
	private _app:core.IApplication;
	private _model:any;
	/* protected */ _routeState:any;
	private _view:any;
	private _viewModel:any;

	get:Controller.IGet;
	set:Controller.ISet;

	constructor(kwArgs?:any) {
		// util.deferMethods(this, ['add'], '_instantiateComponents');
		super(requestUtil.deepCopy(this._getDefaultConfig(), kwArgs));
	}

	add(controller:Controller):IHandle {
		return this._view.add(controller._view, 'default');
	}

	/**
	 * Provides the default configuration for the application. This is a function instead of an object
	 * literal in order to allow subclasses to inherit and modify the default configuration, and to avoid
	 * using lang.clone when creating a copy of the config for a new instance of an application since it
	 * will attempt to blindly execute any `constructor` property it encounters.
	 */
	/* protected */ _getDefaultConfig():Object {
		return {
			modelPath: 'app/models',
			viewPath: 'app/views',
			viewModelPath: 'app/viewModels',
			templatePlugin: 'framework/templating/html',

			modules: {}
		};
	}

	/* protected */ _routeStateSetter(value:any):void {
		this._routeState = value;
	}
	/* protected */ _modelSetter(value:any):void {
		this._model = value;
	}
	/* protected */ _viewSetter(value:any):void {
		this._view = value;
	}

	/**
	 * Loads controller components and attaches them to the controller object.
	 */
	private _loadModules():IPromise<void> {
		var dfd:IDeferred<void> = new Deferred<void>(),
			lazyConstructors:{ [key:string]: number; } = {},
			moduleIdsToLoad:string[] = [],
			modules:Object = this.get('modules');

		for (var key in modules) {
			var module:any = modules[key],
				isTemplate = false,
				ctor:string;
			if (typeof module === 'string') {
				modules[key] = module = { constructor: module };
			}
			if (typeof module.constructor === 'string') {
				ctor = module.constructor;

				if (isTemplate = ctor.charAt(0) === '!') {
					ctor = ctor.slice(1);
				}

				if (ctor.charAt(0) === '/') {
					ctor = ctor.slice(1);
				}
				else if (this.get(key + 'Path')) {
					ctor = this.get(key + 'Path') + '/' + ctor;
				}

				if (isTemplate) {
					ctor = this.get('templatePlugin') + '!' + ctor;
				}
				lazyConstructors[key] = moduleIdsToLoad.push(module.constructor = ctor) - 1;
			}
		}

		require(moduleIdsToLoad, (...loadedModules:Function[]):void => {
			try {
				for (var key in modules) {
					if (modules[key] == null) {
						continue;
					}

					// want to keep original config intact to avoid any confusing changes in original configuration;
					// also want to add a reference to the app first (so it is set before others)
					var config:any = lang.mixin({ app: this.get('app') }, modules[key]);

					if (key in lazyConstructors) {
						config.constructor = loadedModules[lazyConstructors[key]];
					}

					var Module = config.constructor;

					this.set(key, new Module(config));
				}

				dfd.resolve(undefined);
			}
			catch (error) {
				dfd.reject(error);
			}
		});

		return dfd.promise;
	}

	/* protected */ _instantiateComponents(modules:any):void {
		this._viewModel = new modules.viewModel({
			app: this.get('app')
		});

		this._view = new modules.view({
			mediator: this._viewModel
		});
	}

	/**
	 * Starts the controller.
	 *
	 * @returns A promise that is resolved once all modules have been loaded.
	 */
	startup():IPromise<Controller> {
		if (has('debug')) {
			this.on('error', function (event:ErrorEvent):void {
				console.error(event.message);
			});
		}

		var dfd = new Deferred<Controller>();

		this._loadModules().then(():void => {
			var promises:IPromise<any>[] = [],
				promise:IPromise<any>,
				modules:Object = this.get('modules'),
				module:{ startup?:Function; };

			for (var key in modules) {
				module = this.get(key);
				promise = module && module.startup && module.startup();
				if (promise && promise.then) {
					promises.push(promise);
				}
			}

			whenAll(promises).then(():void => {
				dfd.resolve(this);
			});
		}, lang.hitch(dfd, 'reject'));

		this.startup = ():IPromise<Controller> => dfd.promise;

		return dfd.promise;
	}
}

module Controller {
	export interface IGet extends core.IObservableGet {
		(name:'app'):core.IApplication;
		(name:'model'):any;
		(name:'view'):any;
		(name:'viewModel'):any;
	}
	export interface ISet extends core.IObservableSet {
	}
}

export = Controller;

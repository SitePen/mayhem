import array = require('dojo/_base/array');
import core = require('../interfaces');
import data = require('../data/interfaces');
import decl = require('dojo/_base/declare');
import Deferred = require('dojo/Deferred');
import has = require('../has');
import lang = require('dojo/_base/lang');
import ObservableEvented = require('../ObservableEvented');
import requestUtil = require('dojo/request/util');
import util = require('../util');
import whenAll = require('dojo/promise/all');

class BaseController extends ObservableEvented implements core.IController {
	private _app:core.IApplication;
	private _model:data.IModel;
	/* protected */ _routeState:any;
	private _view:any;
	private _viewModel:data.IMediator;

	get:core.IControllerGet;
	set:core.IControllerSet;

	constructor(kwArgs?:any) {
		super(requestUtil.deepCopy(this._getDefaultConfig(), kwArgs));
	}

	add(controller:BaseController, placeholder:string = 'default'):IHandle {
		return this._view.add(controller._view, placeholder);
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
			templatePlugin: require.toAbsMid('../templating/html'),

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
			modules:Object = this.get('modules'),
			promises:{ [key:string]:IPromise<void> } = {};

		for (var key in modules) {
			promises[key] = this._loadModule(key, modules[key], modules);
		}

		return whenAll(promises).then((modules:any):void => this._instantiateModules(modules));
	}

	_instantiateModules(modules:any):void {
		var configs:Object = this.get('modules');
		for (var key in modules) {
			var config:any = configs[key];
			config && this._instantiateModule(key, modules[key], config);
		}
	}

	_instantiateModule(key:string, Module:any, config:any):void {
		if (!Module) {
			return;
		}
		config.constructor = Module;
		this.set(key, new Module(decl.safeMixin({ app: this.get('app') }, config)));
	}

	_loadModule(key:string, config:any, modules:any):IPromise<any> {
		var dfd = new Deferred<any>(),
			isTemplate = false,
			ctor:string;

		if (typeof config === 'string') {
			modules[key] = config = { constructor: config };
		}
		if (typeof config.constructor === 'string') {
			ctor = config.constructor;

			if (isTemplate = ctor.charAt(0) === '!') {
				ctor = ctor.slice(1);
			}

			if (ctor.charAt(0) === '.') {
				// normalize relative paths
				if (this.get(key + 'Path')) {
					ctor = require.toAbsMid(this.get(key + 'Path') + '/' + ctor);
				}
			}

			if (isTemplate) {
				ctor = this.get('templatePlugin') + '!' + ctor;
			}

			config.constructor = ctor;
		}

		if (ctor) {
			require([ctor], (Module:any):void => {
				dfd.resolve(Module);
			});
		}
		else {
			dfd.resolve(config);
		}

		return dfd.promise;
	}

	/**
	 * Starts the controller.
	 *
	 * @returns A promise that is resolved once all modules have been loaded.
	 */
	startup():IPromise<core.IController> {
		if (has('debug')) {
			this.on('error', function (event:any):void {
				console.error(event.message);
			});
		}

		var dfd = new Deferred<core.IController>();

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

		this.startup = ():IPromise<core.IController> => dfd.promise;

		return dfd.promise;
	}
}

export = BaseController;

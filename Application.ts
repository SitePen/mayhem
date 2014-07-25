/// <reference path="./dojo" />

import binding = require('./binding/interfaces');
import core = require('./interfaces');
import Deferred = require('dojo/Deferred');
import has = require('./has');
import lang = require('dojo/_base/lang');
import ObservableEvented = require('./ObservableEvented');
import requestUtil = require('dojo/request/util');
import routing = require('./routing/interfaces');
import Scheduler = require('./Scheduler');
import util = require('./util');
import whenAll = require('dojo/promise/all');

/**
 * The Application class is the base class for all Mayhem applications.
 */
class Application extends ObservableEvented {
	private _modules:HashMap<HashMap<any>>;

	get:Application.Getters;
	on:Application.Events;
	set:Application.Setters;

	constructor(kwArgs?:HashMap<any>) {
		// TODO: more robust configuration merging
		kwArgs = requestUtil.deepCopy(this._getDefaultConfig(), kwArgs);
		super(kwArgs);
	}

	/**
	 * Provides the default configuration for the application. This is a function instead of an object
	 * literal in order to allow subclasses to inherit and modify the default configuration, and to avoid
	 * using lang.clone when creating a copy of the config for a new instance of an application since it
	 * will attempt to blindly execute any `constructor` property it encounters.
	 *
	 * @protected
	 */
	_getDefaultConfig():HashMap<any> {
		return {
			modules: {
				binder: {
					constructor: require.toAbsMid('./binding/ProxtyBinder'),
					proxties: [
						require.toAbsMid('./binding/proxties/MetadataProxty'),
						require.toAbsMid('./binding/proxties/NestedProxty'),
						require.toAbsMid('./binding/proxties/ObservableProxty'),
						require.toAbsMid('./binding/proxties/StatefulProxty'),
						require.toAbsMid('./binding/proxties/NodeTargetProxty'),
						// TODO: Es5Proxty is necessary to support bidi nested binding...what should we do?
						// require.toAbsMid('./binding/proxties/Es5Proxty'),
						require.toAbsMid('./binding/proxties/ObjectTargetProxty')
					]
				},
 				router: {
 					constructor: require.toAbsMid('./routing/NullRouter')
 				},
				scheduler: {
					constructor: require.toAbsMid('./Scheduler')
				}
			}
		};
	}

	_instantiateModules(modules:any):void {
		var configs:HashMap<HashMap<any>> = this._modules;
		for (var key in modules) {
			var config:HashMap<any> = configs[key];
			config && this._instantiateModule(key, modules[key], config);
		}
	}

	_instantiateModule(key:string, Module:any, config:any):void {
		if (!Module) {
			return;
		}
		config.constructor = Module;

		this.set(key, new Module(lang.mixin({ app: this.get('app') }, config)));
	}

	/**
	 * Loads application components and attaches them to the application object.
	 */
	private _loadModules():IPromise<void> {
		var dfd:IDeferred<void> = new Deferred<void>();
		var lazyConstructors:HashMap<number> = {};
		var moduleIdsToLoad:string[] = [];
		var modules:HashMap<HashMap<any>> = this._modules;
		var promises:HashMap<IPromise<void>> = {};

		for (var key in modules) {
			promises[key] = this._loadModule(key, modules[key], modules);
		}

		return whenAll(promises).then((modules:any):void => this._instantiateModules(modules));
	}

	// TODO: There needs to be only one of these, there is another one in Route
	_resolveModuleId(path:string, value:string):string {
		if (!value) {
			return;
		}

		path = path ? path.replace(/\/*$/, '/') : '';
		if (value.charAt(0) !== '.') {
			if (value.indexOf('/') === -1) {
				value = path + value;
			}
		}
		else {
			value = path + value;
		}

		return require.toAbsMid(value);
	}

	_loadModule(key:string, config:any, modules:any):IPromise<any> {
		var dfd = new Deferred<any>(),
			ctor:string;

		if (typeof config === 'string') {
			modules[key] = config = { constructor: config };
		}
		if (typeof config.constructor === 'string') {
			ctor = config.constructor;
		}

		if (ctor) {
			util.getModule(ctor).then((Module:any):any => dfd.resolve(Module), dfd.reject);
		}
		else {
			dfd.resolve(config.constructor);
		}

		return dfd.promise;
	}

	/**
	 * Starts the application.
	 *
	 * @returns A promise that is resolved once all modules have been loaded.
	 */
	startup():IPromise<Application> {
		if (has('debug')) {
			this.on('error', function (event:any):void {
				console.error(event.message);
			});
		}

		var dfd = new Deferred<Application>();

		this._loadModules().then(():IPromise<void> => {
			var promises:IPromise<any>[] = [],
				promise:IPromise<any>,
				modules:HashMap<HashMap<any>> = this._modules,
				module:{ startup?:Function; };

			for (var key in modules) {
				module = this.get(key);
				promise = module && module.startup && module.startup();
				if (promise && promise.then) {
					promises.push(promise);
				}
			}

			return whenAll(promises).then(():void => {
				dfd.resolve(this);
			});
		}).otherwise(lang.hitch(dfd, 'reject'));

		this.startup = function ():IPromise<Application> {
			return dfd.promise;
		};

		return dfd.promise;
	}
}

module Application {
	export interface Events extends ObservableEvented.Events, core.IApplication.Events {}
	export interface Getters extends ObservableEvented.Getters {
		(key:'binder'):binding.IBinder;
		(key:'router'):routing.IRouter;
		(key:'scheduler'):Scheduler;
	}
	export interface Setters extends ObservableEvented.Setters {
		(key:'binder'):binding.IBinder;
		(key:'router'):routing.IRouter;
		(key:'scheduler'):Scheduler;
	}
}

export = Application;

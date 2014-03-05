import binding = require('./binding/interfaces');
import core = require('./interfaces');
import Deferred = require('dojo/Deferred');
import has = require('./has');
import lang = require('dojo/_base/lang');
import ObservableEvented = require('./ObservableEvented');
import util = require('dojo/request/util');
import when = require('dojo/when');
import whenAll = require('dojo/promise/all');

class Application extends ObservableEvented implements core.IApplication {
	get:core.IApplicationGet;
	private _modules:Object;

	/**
	 * Replaces the configuration kwArgs object that gets passed to the constructor with one that
	 * includes defaults and reapplies properties to the application instance.
	 */
	constructor(kwArgs:Object) {
		super(util.deepCopy(this._getDefaultConfig(), kwArgs));
	}

	/**
	 * Provides the default configuration for the application. This is a function instead of an object
	 * literal in order to allow subclasses to inherit and modify the default configuration, and to avoid
	 * using lang.clone when creating a copy of the config for a new instance of an application since it
	 * will attempt to blindly execute any `constructor` property it encounters.
	 */
	/* protected */ _getDefaultConfig():Object {
		return {
			modules: {
				binder: {
					constructor: 'framework/binding/ProxtyBinder',
					proxties: [
						'framework/binding/proxties/MetadataProxty',
						'framework/binding/proxties/NestedProxty',
						'framework/binding/proxties/ObservableProxty',
						'framework/binding/proxties/StatefulProxty',
						'framework/binding/proxties/NodeTargetProxty',
						// TODO: Es5Proxty is necessary to support bidi nested binding...what should we do?
						// 'framework/binding/proxties/Es5Proxty',
						'framework/binding/proxties/ObjectTargetProxty'
					]
				},
// TODO: Fix-up and re-enable
// 				router: {
// 					constructor: 'framework/routing/NullRouter'
// 				},
				scheduler: {
					constructor: 'framework/Scheduler'
				}
			}
		};
	}

	/**
	 * Loads application components and attaches them to the application object.
	 */
	private _loadModules():IPromise<void> {
		var dfd:IDeferred<void> = new Deferred<void>(),
			lazyConstructors:{ [key:string]: number; } = {},
			moduleIdsToLoad:string[] = [],
			modules:Object = this._modules;

		for (var key in modules) {
			if (modules[key] && typeof modules[key].constructor === 'string') {
				lazyConstructors[key] = moduleIdsToLoad.push(modules[key].constructor) - 1;
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
					var config:any = lang.mixin({ app: this }, modules[key]);

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

	/**
	 * Starts the application.
	 *
	 * @returns A promise that is resolved once all modules have been loaded.
	 */
	startup():IPromise<Application> {
		if (has('debug')) {
			this.on('error', function (event:ErrorEvent):void {
				console.error(event.message);
			});
		}

		var dfd:IDeferred<Application> = new Deferred<Application>();

		this._loadModules().then(():void => {
			var promises:IPromise<any>[] = [],
				promise:IPromise<Application>,
				modules:Object = this._modules,
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

		this.startup = function ():IPromise<Application> {
			return dfd.promise;
		};

		return dfd.promise;
	}
}

export = Application;

/// <reference path="./dojo" />

import binding = require('./binding/interfaces');
import core = require('./interfaces');
import decl = require('dojo/_base/declare');
import Deferred = require('dojo/Deferred');
import has = require('./has');
import lang = require('dojo/_base/lang');
import ObservableEvented = require('./ObservableEvented');
import routing = require('./routing/interfaces');
import ui = require('./ui/interfaces');
import util = require('dojo/request/util');
import whenAll = require('dojo/promise/all');

class Application extends ObservableEvented implements core.IApplication {
	static load(resourceId:string, contextRequire:Function, load:(...modules:any[]) => void):void {
		var start = (config?:any):void => {
			this.start(config).then(load);
		};
		if (resourceId) {
			require([resourceId], start);
		}
		else {
			start();
		}
	}

	static start(config:any = {}):IPromise<core.IApplication> {
		config.modules || (config.modules = { router: null });
		return new this(config).startup();
	}

	get:core.IApplicationGet;
	set:core.IApplicationSet;

	constructor(kwArgs:any = {}) {
		kwArgs = util.deepCopy(this._getDefaultConfig(), kwArgs);
		kwArgs.app = this;
		super(kwArgs);
	}

	add(view:ui.IView, placeholder:string = 'default'):IHandle {
		return this.get('view').add(view, placeholder);
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
// TODO: Fix-up and re-enable
// 				router: {
// 					constructor: require.toAbsMid('./routing/NullRouter')
// 				},
				scheduler: {
					constructor: require.toAbsMid('./Scheduler')
				}
			}
		};
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
		if (key !== 'view') {
			this.set(key, new Module(decl.safeMixin({ app: this.get('app') }, config)));
		}
		else {
			// Ensure the view will instantiate after the binder is ready
			this.get('binder').startup().then(():void => {
				this.set(key, new Module(decl.safeMixin({ app: this.get('app') }, config)));
			});
		}
	}

	/**
	 * Loads application components and attaches them to the application object.
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
			dfd.resolve(config.constructor);
		}

		return dfd.promise;
	}

	/**
	 * Starts the application.
	 *
	 * @returns A promise that is resolved once all modules have been loaded.
	 */
	startup():IPromise<core.IApplication> {
		if (has('debug')) {
			this.on('error', function (event:any):void {
				console.error(event.message);
			});
		}

		var dfd = new Deferred<core.IApplication>();

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
		}).otherwise(lang.hitch(dfd, 'reject'));

		this.startup = ():IPromise<core.IApplication> => dfd.promise;

		return dfd.promise;
	}
}

Application.defaults({
	modelPath: 'app/models',
	templatePath: 'app/views',
	templatePlugin: require.toAbsMid('./templating/html'),
	viewPath: 'app/views',
	viewModelPath: 'app/viewModels'
});

export = Application;

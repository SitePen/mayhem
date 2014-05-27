/// <reference path="./dojo" />

import binding = require('./binding/interfaces');
import core = require('./interfaces');
import Deferred = require('dojo/Deferred');
import has = require('./has');
import lang = require('dojo/_base/lang');
import ObservableEvented = require('./ObservableEvented');
import requestUtil = require('dojo/request/util');
import routing = require('./routing/interfaces');
import ui = require('./ui/interfaces');
import util = require('./util');
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
		// TODO: more robust configuration merging
		kwArgs = requestUtil.deepCopy(this._getDefaultConfig(), kwArgs);
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
 				router: {
 					constructor: require.toAbsMid('./routing/NullRouter'),
					routes: {}
 				},
				scheduler: {
					constructor: require.toAbsMid('./Scheduler')
				},
				view: {
					constructor: require.toAbsMid('./ui/Master'),
					attachTo: null
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

		this.set(key, new Module(lang.mixin({ app: this.get('app') }, config)));
		if (key === 'view') {
			// Ensure the view will defer bindings until after the binder is ready
			this.get('binder').startup().then(():void => {
				var view = this.get('view');
				view.set('model', this);
			});

			if (config.template) {
				// If the user has provided a template, get it, and add it to the master widget
				config.template = this.get('templatePlugin') + '!' + this._resolveModuleId(this.get('templatePath'), config.template);

				util.getModule(config.template).then((Template:any):void => {
					var view = this.get('view');
					view.add(new Template({
						app: this
					}));
				})/*.otherwise((error:any):void => {
					// TODO: Error handling
					throw error;
				})*/;
			}
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
			ctor = this._resolveModuleId(this.get(key + 'Path'), ctor);
			config.constructor = ctor;
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
	startup():IPromise<core.IApplication> {
		if (has('debug')) {
			this.on('error', function (event:any):void {
				console.error(event.message);
			});
		}

		var dfd = new Deferred<core.IApplication>();

		this._loadModules().then(():IPromise<void> => {
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

			return whenAll(promises).then(():void => {
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

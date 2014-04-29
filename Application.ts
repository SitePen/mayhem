/// <reference path="./dojo" />

import binding = require('./binding/interfaces');
import BaseController = require('./BaseController');
import core = require('./interfaces');
import routing = require('./routing/interfaces');
import util = require('dojo/request/util');

class Application extends BaseController implements core.IApplication {
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

	static start(config:any = {}):IPromise<Application> {
		config.modules || (config.modules = { router: null });
		return new this(config).startup();
	}

	get:core.IApplicationGet;

	constructor(kwArgs:any = {}) {
		super(kwArgs);
	}

	_appGetter():core.IApplication {
		return this;
	}

	/**
	 * Provides the default configuration for the application. This is a function instead of an object
	 * literal in order to allow subclasses to inherit and modify the default configuration, and to avoid
	 * using lang.clone when creating a copy of the config for a new instance of an application since it
	 * will attempt to blindly execute any `constructor` property it encounters.
	 */
	/* protected */ _getDefaultConfig():Object {
		return util.deepCopy(super._getDefaultConfig(), {
			controllerPath: 'app/controllers',

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
				},
				stores: {
					constructor: 'framework/store/Manager',
					modelPath: 'app/models',
					storePath: 'app/store'
				}
			}
		});
	}
}

export = Application;

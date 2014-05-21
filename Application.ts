/// <reference path="./dojo" />

import binding = require('./binding/interfaces');
import BaseController = require('./controller/BaseController');
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
		this._app = this;
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
		});
	}

	_instantiateModule(key:string, Module:any, config:any):void {
		if (key !== 'view') {
			super._instantiateModule(key, Module, config);
		}
		else {
			// Ensure the view will instantiate after the binder is ready
			this.get('binder').startup().then(():void => {
				super._instantiateModule(key, Module, config);
			});
		}
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

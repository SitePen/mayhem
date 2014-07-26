import Application = require('./Application');
import binding = require('./binding/interfaces');
import core = require('./interfaces');
import Master = require('./ui/Master');
import util = require('dojo/request/util');

/**
 * The WebApplication class provides a set of default modules that are suitable for use when creating a client-side
 * Web application.
 */
class WebApplication extends Application {
	static _defaultConfig = util.deepCreate(Application._defaultConfig, {
		components: {
			router: {
				constructor: require.toAbsMid('./routing/HashRouter')
			},
			ui: {
				constructor: require.toAbsMid('./ui/Master'),
				view: require.toAbsMid('./templating/html') + '!app/views/Application.html'
			}
		},
		// TODO: Probably wrong
		modelPath: 'app/models',
		templatePath: require.toAbsMid('./templating/html') + '!app/views/',
		viewPath: 'app/views',
		viewModelPath: 'app/viewModels'
	});
}

module WebApplication {
	export interface Events extends Application.Events {}
	export interface Getters extends Application.Getters {
		(key:'name'):string;
		(key:'modelPath'):string;
		(key:'templatePath'):string;
		(key:'viewPath'):string;
		(key:'viewModelPath'):string;
		(key:'ui'):Master;
	}
	export interface Setters extends Application.Setters {
		(key:'name', value:string):void;
		(key:'modelPath', value:string):void;
		(key:'templatePath', value:string):void;
		(key:'viewPath', value:string):void;
		(key:'viewModelPath', value:string):void;
		(key:'ui', value:Master):void;
	}
}

export = WebApplication;

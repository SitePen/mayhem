import Application = require('./Application');
import binding = require('./binding/interfaces');
import core = require('./interfaces');
import util = require('dojo/request/util');

/**
 * The WebApplication class provides a set of default modules that are suitable for use when creating a client-side
 * Web application.
 */
class WebApplication extends Application {
	/**
	 * @protected
	 */
	_getDefaultConfig():HashMap<any> {
		return util.deepCopy(super._getDefaultConfig(), {
			modules: {
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

	/*
	_instantiateModule():void {
		if (key === 'view') {
		// Ensure the view will defer bindings until after the binder is ready
		this.get('binder').startup().then(():void => {
			var view = this.get('view');
			view.set('model', this);
		});

		if (config.template) {
			// If the user has provided a template, get it, and add it to the master widget
			config.template = this._resolveModuleId(this.get('templatePath'), config.template);

			util.getModule(config.template).then((Template:any):void => {
				var view = this.get('view');
				view.add(new Template({
					app: this
				}));
			})/*.otherwise((error:any):void => {
				// TODO: Error handling
				throw error;
			})*-/;
		}
	}
	*/
}

module WebApplication {
	export interface Events extends Application.Events {}
	export interface Getters extends Application.Getters {
		(key:'modelPath'):string;
		(key:'templatePath'):string;
		(key:'viewPath'):string;
		(key:'viewModelPath'):string;
// TODO
// 		(key:'ui'):any;
	}
	export interface Setters extends Application.Setters {
		(key:'modelPath', value:string):void;
		(key:'templatePath', value:string):void;
		(key:'viewPath', value:string):void;
		(key:'viewModelPath', value:string):void;
// TODO
// 		(key:'ui'):any;
	}
}

export = WebApplication;

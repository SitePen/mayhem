import Application = require('./Application');
import Master = require('./ui/Master');
import routing = require('./routing/interfaces');
import util = require('./util');

/**
 * The WebApplication class provides a set of default components that are suitable for use when creating a client-side
 * Web application.
 *
 * The additional core application components provided by the WebApplication class are:
 *
 * * {@link module:mayhem/routing/HashRouter router}: Provides a mechanism for loading and modifying models and views
 *   in response to a URL hash change.
 * * {@link module:mayhem/ui/Master ui}: Provides the user interface for the application.
 *
 * The standard components loaded by WebApplication implement the {@link TODO MVVM} application design pattern, default
 * to the {@link TODO HTML templating language}, and assume the following module ID structure:
 *
 * ```
 * app/ - Your application’s package
 *   models/ - Data models
 *   viewModels/ - View models
 *   views/ - Views & view templates
 *     Application.html - The master view template for the application
 * ```
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

	get:WebApplication.Getters;
	on:WebApplication.Events;
	set:WebApplication.Setters;

	/**
	 * The human-readable name of your application.
	 *
	 * @get
	 * @set
	 */
	private _name:string;

	/**
	 * The root module ID for data models.
	 *
	 * @get
	 * @set
	 * @default app/models
	 */
	private _modelPath:string;

	/**
	 * The router component.
	 *
	 * @get
	 * @set
	 * @default module:mayhem/routing/HashRouter
	 */
	private _router:routing.IRouter;

	/**
	 * The root module ID for view templates.
	 *
	 * @get
	 * @set
	 * @default mayhem/templating/html!app/views
	 */
	private _templatePath:string;

	/**
	 * The user interface component.
	 *
	 * @get
	 * @set
	 * @default module:mayhem/ui/Master
	 */
	private _ui:Master;

	/**
	 * The root module ID for views.
	 *
	 * @get
	 * @set
	 * @default app/views
	 */
	private _viewPath:string;

	/**
	 * The root module ID for view models.
	 *
	 * @get
	 * @set
	 * @default app/viewModels
	 */
	private _viewModelPath:string;
}

module WebApplication {
	export interface Events extends Application.Events {}
	export interface Getters extends Application.Getters {
		(key:'name'):string;
		(key:'modelPath'):string;
		(key:'router'):routing.IRouter;
		(key:'templatePath'):string;
		(key:'viewPath'):string;
		(key:'viewModelPath'):string;
		(key:'ui'):Master;
	}
	export interface Setters extends Application.Setters {
		(key:'name', value:string):void;
		(key:'modelPath', value:string):void;
		(key:'router', value:routing.IRouter):void;
		(key:'templatePath', value:string):void;
		(key:'viewPath', value:string):void;
		(key:'viewModelPath', value:string):void;
		(key:'ui', value:Master):void;
	}
}

export = WebApplication;

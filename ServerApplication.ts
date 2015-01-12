import Application = require('./Application');
import Router = require('./routing/Router');
import util = require('./util');

/**
 * The ServerApplication class provides a set of default components that are suitable for use when creating a server
 * application.
 *
 * The additional core application components provided by the ServerApplication class are:
 *
 * * {@link module:mayhem/routing/HttpRouter router}: Provides a mechanism for loading HttpHandler instances in
 *   response to an HTTP request.
 */
class ServerApplication extends Application {
	static _defaultConfig = util.deepCreate(Application._defaultConfig, {
		components: {
			router: {
				constructor: util.toAbsMid('./routing/HttpRouter')
			}
		}
	});

	get:ServerApplication.Getters;
	on:ServerApplication.Events;
	set:ServerApplication.Setters;

	/**
	 * The human-readable name of your application.
	 *
	 * @get
	 * @set
	 */
	private _name:string;

	/**
	 * The router component.
	 *
	 * @get
	 * @set
	 * @default module:mayhem/routing/HttpRouter
	 */
	private _router:Router;
}

module ServerApplication {
	export interface Events extends Application.Events {}
	export interface Getters extends Application.Getters {
		(key:'name'):string;
		(key:'router'):Router;
	}
	export interface Setters extends Application.Setters {
		(key:'name', value:string):void;
		(key:'router', value:Router):void;
	}
}

export = ServerApplication;

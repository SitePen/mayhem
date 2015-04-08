import Application from './Application';
import { deepCreate } from './util';
import Master = require('./ui/Master');
import Router from './routing/Router';

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
	protected static defaultConfig = deepCreate(Application.defaultConfig, {
		components: {
			router: {
				constructor: require.toAbsMid('./routing/HashRouter')
			},
			ui: {
				constructor: require.toAbsMid('./ui/Master'),
				view: require.toAbsMid('./templating/html') + '!app/views/Application.html'
			}
		}
	});

	/**
	 * The human-readable name of your application.
	 */
	name: string;

	/**
	 * The router component.
	 * @default module:mayhem/routing/HashRouter
	 */
	router: Router;

	/**
	 * The user interface component.
	 * @default module:mayhem/ui/Master
	 */
	ui: Master;
}

export default WebApplication;

import Application = require('./Application');
import core = require('./interfaces');
import routing = require('./routing/interfaces');
import ui = require('./ui/interfaces');
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
				view: {
					constructor: require.toAbsMid('./ui/Master'),
					attachTo: null,
					template: 'Application.html'
				}
			}
		});
	}
}

WebApplication.defaults({
	templatePath: require.toAbsMid('./templating/html') + '!app/views',
	viewPath: 'app/views'
});

export = WebApplication;

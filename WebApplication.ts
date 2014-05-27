import Application = require('./Application');
import core = require('./interfaces');
import routing = require('./routing/interfaces');
import ui = require('./ui/interfaces');
import util = require('dojo/request/util');

class WebApplication extends Application {
	/* protected */ _getDefaultConfig():Object {
		return util.deepCopy(super._getDefaultConfig(), {
			modules: {
				router: {
					constructor: require.toAbsMid('./routing/HashRouter')
				},
				view: {
					template: 'Application.html'
				}
			}
		});
	}
}

WebApplication.defaults({
	templatePlugin: require.toAbsMid('./templating/html')
});

export = WebApplication;

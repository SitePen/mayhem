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
					constructor: '!./Application.html',
					model: this
				}
			}
		});
	}

	startup():IPromise<core.IApplication> {
		var promise = super.startup().then(():core.IApplication => {
			this.get('view').attachToWindow(document.body);
			return this;
		});

		this.startup = function ():IPromise<core.IApplication> {
			return promise;
		};

		return promise;
	}
}

WebApplication.defaults({
	templatePlugin: require.toAbsMid('./templating/html')
});

export = WebApplication;

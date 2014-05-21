import Application = require('./Application');
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

	place(view:any, placeholder?:string):IHandle {
		return this.get('view').add(view, placeholder);
	}

	startup():IPromise<WebApplication> {
		var promise = super.startup().then(():WebApplication => {
			this.get('view').attachToWindow(document.body);
			return this;
		});

		this.startup = function ():IPromise<WebApplication> {
			return promise;
		};

		return promise;
	}
}

WebApplication.defaults({
	templatePlugin: require.toAbsMid('./templating/html')
});

export = WebApplication;

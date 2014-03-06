import Application = require('./Application');
import routing = require('./routing/interfaces');
import ui = require('./ui/interfaces');
import util = require('dojo/request/util');

class WebApplication extends Application {
	router:routing.IRouter;
	ui:any; // TODO ui.IView

	/* protected */ _getDefaultConfig():Object {
		return util.deepCopy(super._getDefaultConfig(), {
			modules: {
				router: {
					constructor: 'framework/routing/HashRouter'
				},
				ui: {
					constructor: 'app/views/ApplicationView',
					viewModel: this
				}
			}
		});
	}

	place(view:any/* ui.IView */, placeholder?:string):IHandle {
		return this.ui.add(view, placeholder);
	}

	startup():IPromise<WebApplication> {
		var promise = super.startup().then(():WebApplication => {
			this.ui.placeAt(document.body);
			return this;
		});

		this.startup = function ():IPromise<WebApplication> {
			return promise;
		};

		return promise;
	}
}

export = WebApplication;

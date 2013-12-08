import Application = require('./Application');
import core = require('./interfaces');
import util = require('dojo/request/util');

class WebApplication extends Application {
	router:core.IRouter;
	ui:core.IView;

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

	place(view:core.IView, placeholder?:string) {
		return this.ui.add(view, placeholder);
	}

	startup():IPromise<WebApplication> {
		var promise = super.startup().then(() => {
			this.ui.placeAt(document.body);
			return this;
		});

		this.startup = function () {
			return promise;
		};

		return promise;
	}
}

export = WebApplication;

/// <reference path="interfaces.ts" />

import util = require('dojo/request/util');
import Application = require('./Application');

class WebApplication extends Application {
	router:IRouter;
	ui:IView;

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

	place(view, placeholder) {
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

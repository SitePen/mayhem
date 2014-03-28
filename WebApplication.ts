/// <reference path="./dojo" />

import Application = require('./Application');
import routing = require('./routing/interfaces');
import ui = require('./ui/interfaces');
import util = require('dojo/request/util');

class WebApplication extends Application {
	router:routing.IRouter;
	ui:ui.IMaster;

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

	place(widget:ui.IWidget, placeholder?:string):IHandle {
		return this.ui.add(widget, placeholder);
	}

	startup():IPromise<WebApplication> {
		var promise = super.startup().then(():WebApplication => {
			this.ui.attachToWindow(document.body);
			return this;
		});

		this.startup = function ():IPromise<WebApplication> {
			return promise;
		};

		return promise;
	}
}

export = WebApplication;

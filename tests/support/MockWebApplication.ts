import util = require('mayhem/util');
import WebApplication = require('mayhem/WebApplication');

class MockWebApplication extends WebApplication {
	static _defaultConfig = util.deepCreate(WebApplication._defaultConfig, {
		components: {
			router: null,
			ui: {
				root: null,
				view: null
			}
		}
	});
}

export = MockWebApplication;

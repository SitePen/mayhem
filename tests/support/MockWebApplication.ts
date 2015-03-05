import util = require('mayhem/util');
import WebApplication = require('mayhem/WebApplication');

class MockWebApplication extends WebApplication {
	protected static defaultConfig = util.deepCreate(WebApplication.defaultConfig, {
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

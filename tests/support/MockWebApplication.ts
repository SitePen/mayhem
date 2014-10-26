import util = require('../../util');
import WebApplication = require('../../WebApplication');

class MockWebApplication extends WebApplication {
	static _defaultConfig = util.deepCreate(WebApplication._defaultConfig, {
		components: {
			router: {
				constructor: require.toAbsMid('../../routing/NullRouter')
			},
			ui: {
				root: null,
				view: null
			}
		}
	});
}

export = MockWebApplication;

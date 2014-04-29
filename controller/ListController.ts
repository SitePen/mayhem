import Controller = require('./Controller');
import util = require('framework/util');

class ListController extends Controller {
	/* protected */ _getDefaultConfig():Object {
		return util.deepMixin(super._getDefaultConfig(), {
			modules: {
				viewModel: 'framework/data/Model'
			}
		});
	}
}

export = ListController;

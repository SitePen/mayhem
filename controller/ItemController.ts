import Controller = require('./Controller');
import util = require('../util');
import whenAll = require('dojo/promise/all');

class ItemController extends Controller {
	/* protected */ _getDefaultConfig():Object {
		return util.deepMixin(super._getDefaultConfig(), {
			modules: {
				viewModel: require.toAbsMid('../data/Mediator')
			}
		});
	}
}

export = ItemController;

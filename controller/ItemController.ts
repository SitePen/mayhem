import Controller = require('./Controller');
import util = require('framework/util');
import whenAll = require('dojo/promise/all');

class ItemController extends Controller {
	/* protected */ _getDefaultConfig():Object {
		return util.deepMixin(super._getDefaultConfig(), {
			modules: {
				viewModel: 'framework/data/Mediator'
			}
		});
	}
}

export = ItemController;

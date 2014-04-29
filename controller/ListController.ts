import Controller = require('./Controller');
import util = require('../util');

class ListController extends Controller {
	constructor(kwArgs:any = {}) {
		util.deferSetters(this, ['model', 'view'], '_viewModelSetter');

		super(kwArgs);
	}

	/* protected */ _getDefaultConfig():Object {
		return util.deepMixin(super._getDefaultConfig(), {
			modules: {
				viewModel: require.toAbsMid('../data/Model')
			}
		});
	}
}

export = ListController;

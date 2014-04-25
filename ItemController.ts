import Controller = require('./Controller');
import util = require('framework/util');

class ItemController extends Controller {
	constructor(kwArgs:any = {}) {
		util.deferSetters(this, ['model', 'view'], '_viewModelSetter');

		super(kwArgs);
	}

	/* protected */ _getDefaultConfig():Object {
		return util.deepMixin(super._getDefaultConfig(), {
			modules: {
				viewModel: '/framework/data/Mediator'
			}
		});
	}

	_modelSetter(value:any):void {
		this['_model'] = value;

		this.get('viewModel').set('model', value);
	}

	_viewSetter(value:any):void {
		this['_view'] = value;

		var viewModel:any = this.get('viewModel');
		if (viewModel) {
			value.set('mediator', viewModel);
		}
	}

	_viewModelSetter(value:any):void {
		this['_viewModel'] = value;

		var view:any = this.get('view');
		if (view) {
			view.set('mediator', value);
		}
	}
}

export = ItemController;

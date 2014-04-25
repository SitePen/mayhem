import Controller = require('./Controller');
import util = require('framework/util');

class ListController extends Controller {
	constructor(kwArgs:any = {}) {
		util.deferSetters(this, ['model', 'view'], '_viewModelSetter');

		super(kwArgs);
	}

	/* protected */ _getDefaultConfig():Object {
		return util.deepMixin(super._getDefaultConfig(), {
			modules: {
				viewModel: '/framework/data/Model'
			}
		});
	}

	_modelSetter(value:any):void {
		this['_model'] = value;

		this.get('viewModel').set('model', value);
	}

	_viewSetter(value:any):void {
		super._viewSetter(value);

		value.set('mediator', this.get('viewModel'));
	}

	_viewModelSetter(value:any):void {
		this['_viewModel'] = value;

		value.set('model', this.get('model'));

		var view:any = this.get('view');
		if (view) {
			view.set('mediator', value);
		}
	}
}

export = ListController;

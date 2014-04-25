import ItemController = require('framework/ItemController');
import Mediator = require('framework/data/Mediator');
import util = require('framework/util');

class Quote extends ItemController {}
Quote.observers({
	routeState: function (routeState:any):void {
		if (!routeState) {
			this.set('model', null);
		}
		else {
			this.get('store').get(routeState.quoteId).then((quote:any):void => {
				this.set('model', quote);
			});
		}
	},
	viewModel: function (viewModel:any):void {
		viewModel['_editing'] = null;
		viewModel.set('editing', false);
	}
});

export = Quote;

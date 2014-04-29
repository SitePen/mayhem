import ItemController = require('framework/ItemController');

class Quote extends ItemController {}
Quote.observers({
	routeState: function (routeState:any):void {
		this.get('viewModel').set('editing', false);
		if (!routeState) {
			this.set('model', null);
		}
		else {
			this.set('model', this.get('store').get(routeState.quoteId));
		}
	},
	viewModel: function (viewModel:any):void {
		viewModel['_editing'] = null;
		viewModel.set('editing', false);
	}
});

export = Quote;

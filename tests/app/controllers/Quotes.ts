import ListController = require('mayhem/controller/ListController');
import util = require('mayhem/util');

class Quotes extends ListController {
}
Quotes.observers({
	routeState: function (routeState:any):void {
		console.log('ROUTE STATE', routeState);
	},
	store: function (store:any):void {
		this.set('model', store);
	},
	viewModel: function (viewModel:any):void {
		this._viewModelHandle && this._viewModelHandle.remove();
		this._viewModelHandle = null;

		if (viewModel) {
			this._viewModelHandle = viewModel.observe('selectedItem', (selectedItem:any):void => {
				if (selectedItem == null) {
					this.get('app').get('router').go('quotes', {});
				}
				else {
					this.get('app').get('router').go('quotes/quote', { quoteId: selectedItem });
				}
			});
		}
	}
});

export = Quotes;

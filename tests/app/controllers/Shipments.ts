import ListController = require('mayhem/controller/ListController');

class Shipments extends ListController {}
Shipments.observers({
	store: function (store:any):void {
		this.set('model', store);
	},
	viewModel: function (viewModel:any):void {
		this._viewModelHandle && this._viewModelHandle.remove();
		this._viewModelHandle = null;

		if (viewModel) {
			this._viewModelHandle = viewModel.observe('selectedItem', (selectedItem:any):void => {
				if (selectedItem == null) {
					this.get('app').get('router').go('shipments', {});
				}
				else {
					this.get('app').get('router').go('shipments/shipment', { shipmentId: selectedItem });
				}
			});
		}
	}
});

export = Shipments;

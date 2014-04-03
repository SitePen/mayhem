import Mediator = require('framework/data/Mediator');
import util = require('framework/util');
import when = require('dojo/when');

class ItemMediator extends Mediator {
	_itemsStore:any;

	constructor(kwArgs?:any) {
		super(kwArgs);

		this.get('app').get('collections').getCollection('items').then((items:any):void => {
			when(items.fetch()).then(():void => {
				this.set('itemsStore', items);
			});
		});

		util.deferSetters(this, ['routeState'], '_itemsStoreSetter');
	}

	_routeStateSetter(routeState:any):void {
		when(this.get('itemsStore').get(routeState.itemId)).then((item:any):void => {
			this.set('model', item);
		});
	}

	_itemsStoreSetter(itemsStore:any):void {
		this._itemsStore = itemsStore;
	}
}

ItemMediator.defaults({
	editing: false
});

export = ItemMediator;

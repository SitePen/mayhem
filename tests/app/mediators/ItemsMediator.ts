/// <reference path="../../../dstore.d.ts"/>
import Mediator = require('framework/data/Mediator');
import Memory = require('dstore/Memory');
import Adapter = require('dstore/legacy/DstoreAdapter');
import Model = require('dstore/Model');

class MyModel extends Model {}

class ItemsMediator extends Mediator {
	_itemsStore:any;

	constructor(kwArgs?:any) {
		super(kwArgs);

		this.get('app').get('collections').getCollection('items').then((items:any):void => {
			this.set('itemsStore', items);
		});
	}

	_itemsStoreSetter(itemsStore:any):void {
		this._itemsStore = itemsStore;
	}
}

ItemsMediator.defaults({
	itemsStore: null
});

export = ItemsMediator;

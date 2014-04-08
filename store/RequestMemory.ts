/// <reference path="../dstore.d.ts"/>

import data = require('../data/interfaces');
import Memory = require('./Memory');
import _ModelMixin = require('./_ModelMixin');
import _RequestMemory = require('dstore/RequestMemory');

class RequestMemory<T extends data.IModel> extends _RequestMemory<T> {
	constructor(kwArgs?:Object) {
		if (!kwArgs || !(<any>kwArgs).cachingStore) {
			this.cachingStore = new Memory<T>();
		}

		super(kwArgs);
	}
}

_ModelMixin.mixin(RequestMemory);

export = RequestMemory;

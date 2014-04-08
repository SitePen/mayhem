/// <reference path="../dstore.d.ts"/>

import data = require('../data/interfaces');
import _Memory = require('dstore/Memory');
import _ModelMixin = require('./_ModelMixin');

class Memory<T extends data.IModel> extends _Memory<T> {
	// TODO: correct querying
}
_ModelMixin.mixin(Memory);

export = Memory;

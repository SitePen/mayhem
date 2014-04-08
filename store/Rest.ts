/// <reference path="../dstore.d.ts"/>

import data = require('../data/interfaces');
import _ModelMixin = require('./_ModelMixin');
import _Rest = require('dstore/Rest');

class Rest<T extends data.IModel> extends _Rest<T> {
}

_ModelMixin.mixin(Rest);

export = Rest;

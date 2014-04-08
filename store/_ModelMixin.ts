/// <reference path="../dojo.d.ts"/>

import lang = require('dojo/_base/lang');

class ModelMixin {
	idProperty:string;

	static mixin(Ctor:Function):void {
		lang.mixin(Ctor.prototype, this.prototype);
	}

	getIdentity(item:any):any {
		return item.get(this.idProperty);
	}

	_setIdentity(item:any, identity:any):any {
		item.set(this.idProperty, identity);
		return item.get(this.idProperty);
	}
}

export = ModelMixin;

/// <reference path="../interfaces.ts" />

var oidKey = '__PropertyOid' + Math.random(),
	oid = 0;

/* abstract */ class Property /* implements IBoundProperty */ {
	id:string;
	constructor(object:Object, binding:string) {
		if (!object[oidKey]) {
			object[oidKey] = (++oid);
		}

		this.id = object[oidKey] + '/' + binding;
	}
}

export = Property;

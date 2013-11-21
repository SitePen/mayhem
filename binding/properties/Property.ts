/// <reference path="../interfaces.ts" />

var oidKey = '__PropertyOid' + Math.random(),
	oid = 0;

/* abstract */ class Property /* implements IBoundProperty */ {
	id:string;
	constructor(kwArgs:IPropertyBinderArguments) {
		var object = kwArgs.object;

		if (!object[oidKey]) {
			object[oidKey] = (++oid);
		}

		this.id = object[oidKey] + '/' + kwArgs.binding;
	}
}

export = Property;

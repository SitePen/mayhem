import binding = require('../interfaces');
import has = require('../../has');

var oidKey = '__PropertyOid' + Math.random(),
	oid = 0;

/* abstract */ class Property /* implements binding.IBoundProperty */ {
	id:string;
	constructor(kwArgs:binding.IPropertyBinderArguments) {
		var object = kwArgs.object;

		if (!object[oidKey]) {
			if (has('es5')) {
				Object.defineProperty(object, oidKey, {
					value: (++oid),
					configurable: true
				});
			}
			else {
				object[oidKey] = (++oid);
			}
		}

		this.id = 'Property' + object[oidKey] + '/' + kwArgs.binding;
	}
}

export = Property;

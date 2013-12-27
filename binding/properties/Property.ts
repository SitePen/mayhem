import binding = require('../interfaces');
import has = require('../../has');

// `oidKey` intentionally uses a unique string so that it is easily discoverable within the source code for anyone
// that notices the property appearing on their objects. Please don't be clever and try to save memory by reducing it
// TODO: Two applications on one page using the same copy of Mayhem, binding to the same object, will break.
var oidKey = '__PropertyOid' + Math.random(),
	oid = 0;

/**
 * The Property class is the base class for all property binder implementations.
 */
/* abstract */ class Property /* implements binding.IBoundProperty */ {
	id:string;

	constructor(kwArgs:binding.IPropertyBinderArguments) {
		var object = kwArgs.object;

		// The objects being bound to needs to be able to be persistently uniquely identified in order to debounce
		// multiple changes to properties within the scheduler. Since EcmaScript provides no mechanism for getting a
		// unique serialized object ID, this does the next best thing and generates a unique-per-page identifier that
		// is attached to the object as quietly as possible
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

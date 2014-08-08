import binding = require('./interfaces');
import has = require('../has');
import Proxty = require('../Proxty');

// `oidKey` intentionally uses a unique string so that it is easily discoverable within the source code for anyone
// that notices the property appearing on their objects. Please don't be clever and try to save memory by reducing it
// TODO: Two applications on one page using the same copy of Mayhem, binding to the same object, will break.
var oidKey:string = '__BindingOid' + String(Math.random()).slice(2);
var oid:number = 0;

/**
 * The BindingProxty class is the base class for all property binder implementations.
 *
 * @abstract
 */
class Binding<SourceT, TargetT> extends Proxty<SourceT> {
	/**
	 * The identifier for this binding. Binding on the same object property will have the same identifier.
	 */
	id:string;

	/**
	 * Determines whether or not this binding constructor can be used to create a binding using the provided binding
	 * arguments.
	 *
	 * @memberof module:mayhem/binding/Binding
	 * @member test
	 * @method
	 */

	constructor(kwArgs:binding.IBindingArguments) {
		super(undefined);

		var object = <HashMap<any>> kwArgs.object;

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

		this.id = 'Binding' + object[oidKey] + '/' + kwArgs.path;
	}

	/**
	 * Sets the target property to bind to. The target will have its value reset immediately upon binding.
	 *
	 * @memberof module:mayhem/binding/Binding#
	 * @member bindTo
	 * @method
	 */

	/**
	 * Destroys the binding.
	 *
	 * @memberof module:mayhem/binding/Binding#
	 * @member destroy
	 * @method
	 */

	/**
	 * Gets the current value of the bound property.
	 *
	 * @memberof module:mayhem/binding/Binding#
	 * @member get
	 * @method
	 */

	/**
	 * Sets the value of this property. This is intended to be used to update the value of this property from another
	 * bound property and so will not be propagated to the target object, if one exists.
	 *
	 * @memberof module:mayhem/binding/Binding#
	 * @member set
	 * @method
	 */
}

export = Binding;
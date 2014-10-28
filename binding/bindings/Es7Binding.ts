import binding = require('../interfaces');
import Binding = require('../Binding');
import util = require('../../util');

interface Change<T> {
	name:string;
	object:any;
	oldValue:T;
	type:string;
}

/**
 * The Es7Binding uses Object.observe to observe an object for changes.
 */
class Es7Binding<T> extends Binding<T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		return util.isObject(kwArgs.object) && typeof kwArgs.path === 'string';
	}

	/**
	 * The object containing the final property to be bound.
	 * @protected
	 */
	// Uses `any` type since this code uses arbitrary properties
	_object:any;

	/**
	 * The key for the final property to be bound.
	 * @protected
	 */
	_property:string;

	private _observer:Function;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var self = this;
		this._object = kwArgs.object;
		this._property = kwArgs.path;
		this._observer = function (changes:Change<T>[]):void {
			var change:Change<T>;
			for (var i = changes.length - 1; (change = changes[i]); --i) {
				if (change.name === kwArgs.path) {
					self.notify({
						oldValue: change.oldValue,
						value: self.get()
					});
					break;
				}
			}
		};

		(<any> Object).observe(kwArgs.object, this._observer, [ 'add', 'update', 'delete' ]);
	}

	destroy():void {
		super.destroy();
		(<any> Object).unobserve(this._object, this._observer);
		this._observer = this._object = this._property = null;
	}

	get():T {
		return this._object ? this._object[this._property] : undefined;
	}

	set(value:T):void {
		if (this._object && !util.isEqual(this.get(), value)) {
			this._object[this._property] = value;
		}
	}
}

export = Es7Binding;

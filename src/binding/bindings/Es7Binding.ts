import * as binding from '../interfaces';
import Binding from '../Binding';
import { isEqual, isObject } from '../../util';

interface Change<T> {
	name: string;
	object: any;
	oldValue: T;
	type: string;
}

/**
 * The Es7Binding uses Object.observe to observe an object for changes.
 */
class Es7Binding<T> extends Binding<T> {
	static test(kwArgs: binding.IBindingArguments): boolean {
		return isObject(kwArgs.object) && typeof kwArgs.path === 'string';
	}

	/**
	 * The object containing the final property to be bound.
	 */
	// Uses `any` type since this code uses arbitrary properties
	private _object: any;

	/**
	 * The key for the final property to be bound.
	 */
	private _property: string;

	private _observer: Function;

	constructor(kwArgs: binding.IBindingArguments) {
		super(kwArgs);

		var self = this;
		this._object = kwArgs.object;
		this._property = kwArgs.path;
		this._observer = function (changes: Change<T>[]) {
			var change: Change<T>;
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

	destroy() {
		super.destroy();
		(<any> Object).unobserve(this._object, this._observer);
		this._observer = this._object = this._property = null;
	}

	get(): T {
		return this._object ? this._object[this._property] : undefined;
	}

	set(value: T): void {
		if (this._object && !isEqual(this.get(), value)) {
			this._object[this._property] = value;
		}
	}
}

export default Es7Binding;

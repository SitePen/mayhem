import * as binding from '../interfaces';
import Binding from '../Binding';
import { isEqual, isObject } from '../../util';

/**
 * The ObjectTargetBinding enables the use of any object as the target of a binding in all EcmaScript environments.
 * This binding is only necessary when attempting to run in pre-EcmaScript 5 environments, or when attempting to bind
 * to a host object in WebKit browsers impacted by https://code.google.com/p/chromium/issues/detail?id=43394.
 */
class ObjectTargetBinding<T> extends Binding<T> {
	static test(kwArgs: binding.IBindingArguments): boolean {
		return isObject(kwArgs.object) && typeof kwArgs.path === 'string';
	}

	/**
	 * The object containing the final property to be bound.
	 */
	protected object: {};

	/**
	 * The key for the final property to be bound.
	 */
	protected property: string;

	constructor(kwArgs: binding.IBindingArguments) {
		super(kwArgs);

		this.object = kwArgs.object;
		this.property = kwArgs.path;
	}

	destroy(): void {
		super.destroy();
		this.object = this.property = null;
	}

	get(): T {
		return this.object ? (<any> this.object)[this.property] : undefined;
	}

	getObject(): {} {
		return this.object;
	}

	set(value: T): void {
		if (this.object && !isEqual(this.get(), value)) {
			(<any> this.object)[this.property] = value;
		}
	}
}

export = ObjectTargetBinding;

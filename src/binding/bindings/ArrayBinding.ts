import Binding from '../Binding';
import * as binding from '../interfaces';

class ArrayBinding<T> extends Binding<T> {
	static test(kwArgs: binding.IBindingArguments): boolean {
		return kwArgs.object instanceof Array && kwArgs.path === '*';
	}

	private _object: T[];

	constructor(kwArgs: binding.IBindingArguments) {
		super(kwArgs);

		var array: T[] = this._object = <T[]> kwArgs.object;
		var self = this;

		// TODO: Improve efficiency by adding a notification overlay to the array so these functions only ever get
		// attached once and additional binding observers can just reuse the same generated data. Also, undo this
		// when the binding is destroyed, like Es5Binder
		var pop = array.pop;
		array.pop = function () {
			if (this.length) {
				var oldValue: T = pop.apply(this, arguments);
				self.notify && self.notify({ index: this.length, removed: [ oldValue ] });
				return oldValue;
			}
		};
		var push = array.push;
		array.push = function (...newValues: T[]) {
			var newLength: number = push.apply(this, arguments);
			self.notify && self.notify({ index: newLength - newValues.length, added: newValues });
			return newLength;
		};
		var reverse = array.reverse;
		array.reverse = function () {
			var oldValues: T[] = this.slice(0);
			var returnValue: T[] = reverse.apply(this, arguments);
			self.notify && self.notify({ index: 0, removed: oldValues, added: this });
			return returnValue;
		};
		var shift = array.shift;
		array.shift = function () {
			if (this.length) {
				var oldValue: T = shift.apply(this, arguments);
				self.notify && self.notify({ index: 0, removed: [ oldValue ] });
				return oldValue;
			}
		};
		var sort = array.sort;
		array.sort = function () {
			var oldValues: T[] = this.slice(0);
			var returnValue: T[] = sort.apply(this, arguments);
			self.notify && self.notify({ index: 0, removed: oldValues, added: this });
			return returnValue;
		};
		var splice = array.splice;
		array.splice = function (index: number, numToRemove: number = 0, ...newValues: T[]) {
			var oldValues: T[] = splice.apply(this, arguments);
			self.notify && self.notify({ index: index, removed: oldValues, added: newValues });
			return oldValues;
		};
		var unshift = array.unshift;
		array.unshift = function (...newValues: T[]) {
			var newLength: number = unshift.apply(this, arguments);
			self.notify && self.notify({ index: 0, added: newValues });
			return newLength;
		};
	}

	destroy(): void {
		super.destroy();

		// Stop attempts to notify on the array after the binding has been destroyed
		// TODO: This should be made better
		this._object = this.notify = null;
	}

	getObject(): {} {
		return this._object;
	}
}

export default ArrayBinding;

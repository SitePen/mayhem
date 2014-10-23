import Binding = require('../Binding');
import binding = require('../interfaces');

class ArrayBinding<T extends Array<any>> extends Binding<T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		return kwArgs.object instanceof Array && kwArgs.path === '*';
	}

	private _object:T;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var array:T = this._object = <any> kwArgs.object;
		var self = this;

		// TODO: Improve efficiency by adding a notification overlay to the array so these functions only ever get
		// attached once and additional binding observers can just reuse the same generated data. Also, undo this
		// when the binding is destroyed, like Es5Binder
		var pop = array.pop;
		array.pop = function ():any {
			if (this.length) {
				var oldValue = pop.apply(this, arguments);
				self.notify && self.notify({ index: this.length, removed: [ oldValue ] });
				return oldValue;
			}
		};
		var push = array.push;
		array.push = function (...newValues:any[]):number {
			var newLength = push.apply(this, arguments);
			self.notify && self.notify({ index: newLength - newValues.length, added: newValues });
			return newLength;
		};
		var reverse = array.reverse;
		array.reverse = function ():typeof array {
			var oldValues = this.slice(0);
			var returnValue = reverse.apply(this, arguments);
			self.notify && self.notify({ index: 0, removed: oldValues, added: this });
			return returnValue;
		};
		var shift = array.shift;
		array.shift = function ():any {
			if (this.length) {
				var oldValue = shift.apply(this, arguments);
				self.notify && self.notify({ index: 0, removed: [ oldValue ] });
				return oldValue;
			}
		};
		var sort = array.sort;
		array.sort = function ():typeof array {
			var oldValues = this.slice(0);
			var returnValue = sort.apply(this, arguments);
			self.notify && self.notify({ index: 0, removed: oldValues, added: this });
			return returnValue;
		};
		var splice = array.splice;
		array.splice = function (index:number, numToRemove:number = 0, ...newValues:any[]):any {
			var oldValues = splice.apply(this, arguments);
			self.notify && self.notify({ index: index, removed: oldValues, added: newValues });
			return oldValues;
		};
		var unshift = array.unshift;
		array.unshift = function (...newValues:any[]):number {
			var newLength = unshift.apply(this, arguments);
			self.notify && self.notify({ index: 0, added: newValues });
			return newLength;
		};
	}

	getObject():{} {
		return this._object;
	}

	destroy():void {
		super.destroy();

		// Stop attempts to notify on the array after the binding has been destroyed
		// TODO: This should be made better
		this._object = this.notify = null;
	}
}

export = ArrayBinding;

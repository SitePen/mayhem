import Binding from '../Binding';
import * as binding from '../interfaces';

class CollectionLengthBinding extends Binding<number> {
	static test(kwArgs: binding.IBindingArguments): boolean {
		return 'fetchRange' in kwArgs.object &&
			'on' in kwArgs.object &&
			kwArgs.path === 'totalLength';
	}

	private _handle: IHandle;
	private _object: dstore.ICollection<any>;
	private _value: number;

	constructor(kwArgs: binding.IBindingArguments) {
		super(kwArgs);

		var self = this;
		this._object = <dstore.ICollection<any>> kwArgs.object;
		this._handle = this._object.on('add, update, delete', function (event: dstore.ChangeEvent<any>) {
			if (event.totalLength != null) {
				var oldValue = self._value;
				self._value = event.totalLength;
				self.notify({ oldValue: oldValue, value: event.totalLength });
			}
		});
		this._object.fetchRange({ start: 0, end: 0 }).totalLength.then(function (length) {
			self._value = length;
			self.notify({ value: length });
		});
	}

	destroy(): void {
		super.destroy();

		this._object.tracking.remove();
		this._handle.remove();
		this._handle = this._object = null;
	}

	get(): number {
		return this._value;
	}

	getObject(): {} {
		return this._object;
	}

	notify(change: binding.IChangeRecord<number>): void {
		return super.notify(change);
	}
}

export = CollectionLengthBinding;

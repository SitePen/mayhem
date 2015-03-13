import Binding = require('../Binding');
import binding = require('../interfaces');

class CollectionLengthBinding extends Binding<number> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		return 'fetchRange' in kwArgs.object && 'on' in kwArgs.object && kwArgs.path === 'totalLength';
	}

	private _handle:IHandle;
	private _object:dstore.ICollection<any>;
	private _value:number;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var self = this;
		this._object = <any> kwArgs.object;
		this._handle = this._object.on('add, update, delete', function (event:dstore.ChangeEvent<any>):void {
			if (event.totalLength != null) {
				var oldValue:number = self._value;
				self._value = event.totalLength;
				self.notify({ oldValue: oldValue, value: event.totalLength });
			}
		});
		this._object.fetchRange({ start: 0, end: 0 }).totalLength.then(function (length:number):void {
			self._value = length;
			self.notify({ value: length });
		});
	}

	get():number {
		return this._value;
	}

	getObject():{} {
		return this._object;
	}

	destroy():void {
		super.destroy();

		this._object.tracking.remove();
		this._handle.remove();
		this._handle = this._object = null;
	}
}

export = CollectionLengthBinding;

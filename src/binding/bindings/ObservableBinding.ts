import binding = require('../interfaces');
import Binding = require('../Binding');
import core = require('../../interfaces');

/**
 * The ObservableBinding class enables binding to {@link module:mayhem/Observable} objects.
 */
class ObservableBinding<T> extends Binding<T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		var object = <core.IObservable> kwArgs.object;
		return object != null && typeof object.get === 'function' &&
			typeof object.set === 'function' &&
			typeof object.observe === 'function' &&
			typeof kwArgs.path === 'string';
	}

	/**
	 * The watch handle for the bound object.
	 */
	private _handle:IHandle;

	/**
	 * The object containing the final property to be bound.
	 */
	private _object:core.IObservable;

	/**
	 * The key for the final property to be bound.
	 */
	private _property:string;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		var object = this._object = <core.IObservable> kwArgs.object;
		this._property = kwArgs.path;

		var self = this;
		this._handle = object.observe(kwArgs.path, function (newValue:T, oldValue:T):void {
			self.notify({ oldValue: oldValue, value: newValue });
		});
	}

	destroy():void {
		super.destroy();
		this._handle.remove();
		this._handle = this._object = null;
	}

	get():T {
		return this._object ? <any> this._object.get(this._property) : undefined;
	}

	getObject():{} {
		return this._object;
	}

	set(value:T):void {
		this._object && this._object.set(this._property, value);
	}
}

export = ObservableBinding;

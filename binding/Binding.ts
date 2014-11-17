import binding = require('./interfaces');
import util = require('../util');

class Binding<T> implements binding.IBinding<T> {
	/**
	 * @protected
	 */
	_binder:binding.IBinder;

	/**
	 * @protected
	 */
	_observers:binding.IObserver<T>[];

	constructor(kwArgs:binding.IBindingArguments) {
		this._binder = kwArgs.binder;
		this._observers = [];
	}

	destroy():void {
		this.destroy = function () {};
		this._observers = this._binder = null;
	}

	get():T {
		return undefined;
	}

	getObject():{} {
		return undefined;
	}

	notify(change:binding.IChangeRecord<any>):void {
		var observers = this._observers.slice(0);
		for (var i = 0, observer:binding.IObserver<T>; (observer = observers[i]); ++i) {
			observer(change);
		}
	}

	observe(observer:binding.IObserver<T>, invokeImmediately:boolean = false):IHandle {
		var observers = this._observers;
		observers.push(observer);
		invokeImmediately && observer({ value: this.get() });

		return util.createHandle(function () {
			util.spliceMatch(observers, observer);
			observers = observer = null;
		});
	}
}

export = Binding;

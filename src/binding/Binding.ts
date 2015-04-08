import * as binding from './interfaces';
import { createHandle, spliceMatch } from '../util';

class Binding<T> implements binding.IBinding<T> {
	protected binder: binding.IBinder;
	protected observers: binding.IObserver<T>[];

	constructor(kwArgs: binding.IBindingArguments) {
		this.binder = kwArgs.binder;
		this.observers = [];
	}

	destroy(): void {
		this.destroy = function () {};
		this.observers = this.binder = null;
	}

	get(): T {
		return undefined;
	}

	getObject(): {} {
		return undefined;
	}

	notify(change: binding.IChangeRecord<T>): void {
		var observers = this.observers.slice(0);
		for (var i = 0, observer: binding.IObserver<T>; (observer = observers[i]); ++i) {
			observer(change);
		}
	}

	observe(observer: binding.IObserver<T>, invokeImmediately: boolean = false): IHandle {
		var observers = this.observers;
		observers.push(observer);
		invokeImmediately && observer({ value: this.get() });

		return createHandle(function () {
			spliceMatch(observers, observer);
			observers = observer = null;
		});
	}
}

export default Binding;

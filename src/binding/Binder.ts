import BindDirection from './BindDirection';
import * as binding from './interfaces';
import BindingError from './BindingError';
import { createHandle, getModule, spliceMatch } from '../util';
import { delegate } from 'dojo/_base/lang';
import has from '../has';
import Promise from '../Promise';
import WeakMap from '../WeakMap';

/**
 * The Binder class provides a default data binder that uses Binding objects to enable binding between arbitrary
 * properties of two different objects.
 *
 * When creating a new Binder instance, a default list of Binding constructors can be provided through the
 * `constructors` argument. This list of constructors can contain functions that implement
 * {@link interface:binding.IBindingConstructor}, or module IDs that resolve to the same. When the Binder starts up,
 * any module IDs in the list will be loaded and replaced with the value of those modules.
 */
class Binder implements binding.IBinder {
	private _bindingRegistry: WeakMap<{}, HashMap<binding.IBinding<any>>>;

	/**
	 * The list of Binding constructors available for use by this data binder.
	 */
	constructors: Array<string | binding.IBindingConstructor>;

	/**
	 * Whether or not to use the {@link module:mayhem/Scheduler event scheduler} when creating new bindings.
	 *
	 * @default false
	 */
	useScheduler: boolean;

	constructor(kwArgs: Binder.KwArgs) {
		this._bindingRegistry = new WeakMap<{}, HashMap<binding.IBinding<any>>>();
		this.constructors = kwArgs.constructors || [];
		this.useScheduler = 'useScheduler' in kwArgs ? kwArgs.useScheduler : false;
	}

	/**
	 * Registers a new Binding constructor with the data binder. This method can be used to dynamically add and remove
	 * support for different bindings at runtime.
	 *
	 * @param Ctor The Binding constructor.
	 * @param index The priority of the newly added constructor. Constructors closer to zero are evaluated first.
	 * @returns A handle that can be used to remove the Binding constructor from the data binder.
	 */
	add(Ctor: binding.IBindingConstructor, index: number = Infinity): IHandle {
		var constructors = this.constructors;

		constructors.splice(index, 0, Ctor);

		return createHandle(function () {
			spliceMatch(constructors, Ctor);
			Ctor = constructors = null;
		});
	}

	/**
	 * Creates a data binding between two objects.
	 *
	 * @param kwArgs The binding arguments for how a data binding should be created.
	 * @returns A handle that can be used to remove the binding or change its source, target, or direction.
	 */
	bind<T>(kwArgs: binding.IBindArguments): binding.IBindingHandle {
		var self = this;
		var direction = kwArgs.direction || BindDirection.TWO_WAY;
		var source: binding.IBinding<T>;
		var target: binding.IBinding<T>;
		var targetObserverHandle: IHandle;

		source = this.createBinding<T>(kwArgs.source, kwArgs.sourcePath);
		target = this.createBinding<T>(kwArgs.target, kwArgs.targetPath);

		function setTargetValue(change: binding.IChangeRecord<T>) {
			if (!target) {
				console.debug('BUG: Binding should be destroyed, but attempted to set on target');
				return;
			}

			target.set(change.value);
		}

		function setSourceValue(change: binding.IChangeRecord<T>) {
			source.set && source.set(change.value);
		}

		source.observe(setTargetValue);
		setTargetValue({ value: source.get() });

		if (direction === BindDirection.TWO_WAY) {
			targetObserverHandle = target.observe(setSourceValue);
		}

		var handle: binding.IBindingHandle = {
			setSource: function (newSource: {}, newSourcePath: string = kwArgs.sourcePath) {
				source.destroy();
				source = self.createBinding<T>(newSource, newSourcePath);

				if (has('debug')) {
					this._source = source;
				}

				source.observe(setTargetValue);
				setTargetValue({ value: source.get() });
			},
			setTarget: function (newTarget: {}, newTargetPath: string = kwArgs.targetPath) {
				target.destroy();
				targetObserverHandle = null;
				target = self.createBinding<T>(newTarget, newTargetPath);

				if (has('debug')) {
					this._target = target;
				}

				if (direction === BindDirection.TWO_WAY) {
					targetObserverHandle = target.observe(setSourceValue);
				}

				setTargetValue({ value: source.get() });
			},
			setDirection: function (newDirection: BindDirection) {
				targetObserverHandle && targetObserverHandle.remove();
				if (newDirection === BindDirection.TWO_WAY) {
					targetObserverHandle = target.observe(setSourceValue);
				}
			},
			remove: function () {
				this.remove = function () {};
				source.destroy();
				target.destroy();
				self = source = target = targetObserverHandle = null;
			}
		};

		if (has('debug')) {
			(<any> handle)._source = source;
			(<any> handle)._target = target;
		}

		return handle;
	}

	/**
	 * Creates a Binding object that can be used to observe changes to the property of an object.
	 *
	 * @param object The object to bind to.
	 * @param path The binding path to use.
	 * @param options Additional options to use when creating the binding.
	 * @param options.scheduled Whether or not to use the event scheduler to defer notification of the changed value
	 * until the next event loop. This improves binding efficiency by ensuring that a bound target property will only
	 * change once per event loop, no matter how many times it is set. This defaults to the `useScheduler` property of
	 * the Binder instance.
	 * @returns A new Binding object.
	 */
	createBinding<T>(object: {}, path: string, options: { useScheduler?: boolean; } = {}): binding.IBinding<T> {
		var map = this._bindingRegistry.get(object);
		if (!map) {
			map = {};
			this._bindingRegistry.set(object, map);
		}

		var binding: binding.IBinding<T>;
		if (typeof path !== 'string' || !(binding = map[path])) {
			var constructors = <binding.IBindingConstructor[]> this.constructors;

			for (var i = 0, Binding: binding.IBindingConstructor; (Binding = constructors[i]); ++i) {
				if (Binding.test({ object: object, path: path, binder: this })) {
					binding = new Binding<T>({
						object: object,
						path: path,
						binder: this
					});
					break;
				}
			}

			if (!binding) {
				throw new BindingError(
					'No registered binding constructors understand the requested binding "{binding}" on {object}.', {
						object: object,
						path: path,
						binder: this
					}
				);
			}

			// We can only store bindings whose paths are strings, other types of paths will always get a totally new
			// binding
			if (typeof path !== 'string') {
				return binding;
			}

			map[path] = binding;
		}

		return delegate(binding, {
			_localObservers: [],
			destroy: function () {
				this.destroy = function () {};
				var observers = this.observers;
				var localObservers = this._localObservers;
				for (var i = 0, observer: binding.IObserver<T>; (observer = localObservers[i]); ++i) {
					spliceMatch(observers, observer);
				}
				this._localObservers = null;
				// NOTE: the binding is not destroyed as it may be in use by other callers (if multiple callers created
				// a binding to the same object & property)
				binding = map = null;
			},
			observe: function (observer: binding.IObserver<T>): IHandle {
				var handle: IHandle = binding.observe.apply(binding, arguments);
				var localObservers = this._localObservers;
				localObservers.push(observer);
				return createHandle(function () {
					spliceMatch(localObservers, observer);
					handle.remove();
					handle = localObservers = observer = null;
				});
			}
		});
	}

	notify(object: {}, property: string, change: binding.IChangeRecord<any>): void {
		var bindings = this._bindingRegistry.get(object);

		if (bindings && bindings[property]) {
			bindings[property].notify(change);
		}
	}

	// TODO: Observable#observe should no longer be a thing eventually, anyone wanting to bind to such an object should
	// simply use the binder directly
	observe(object: {}, property: string, observer: binding.IObserver<any>): IHandle {
		var binding = this.createBinding(object, property);
		binding.observe(observer);
		return createHandle(function () {
			binding.destroy();
			binding = null;
		});
	}

	run(): Promise<void> {
		var constructors = this.constructors;

		function loadConstructor(index: number, moduleId: string) {
			return getModule(moduleId, true).then(function (Binding: binding.IBindingConstructor) {
				constructors.splice(index, 1, Binding);
			});
		}

		var promises: Promise<void>[] = [];

		for (var i = 0, Ctor: string | binding.IBindingConstructor; (Ctor = this.constructors[i]); ++i) {
			if (typeof Ctor === 'string') {
				promises.push(loadConstructor(i, Ctor));
			}
		}

		var promise = Promise.all(promises).then(function () {});
		this.run = function () {
			return promise;
		};
		return promise;
	}

	/**
	 * Tests whether or not the data binder will be able to successfully create a data binding using the given
	 * arguments.
	 *
	 * @param kwArgs The binding arguments to test.
	 * @returns `true` if the binding is possible.
	 */
	test(kwArgs: binding.IBindArguments): boolean {
		var sourceBindingValid = false;
		var targetBindingValid = false;

		var constructors = <binding.IBindingConstructor[]> this.constructors;
		for (var i = 0, Binding: binding.IBindingConstructor; (Binding = constructors[i]); ++i) {
			if (!sourceBindingValid && Binding.prototype.get && Binding.test({
				object: kwArgs.source,
				path: kwArgs.sourcePath,
				binder: this
			})) {
				sourceBindingValid = true;
			}

			if (!targetBindingValid && Binding.prototype.set && Binding.test({
				object: kwArgs.target,
				path: kwArgs.targetPath,
				binder: this
			})) {
				targetBindingValid = true;
			}

			if (sourceBindingValid && targetBindingValid) {
				return true;
			}
		}

		return false;
	}
}

module Binder {
	export interface KwArgs {
		constructors: Array<string | binding.IBindingConstructor>;
		useScheduler?: boolean;
	}
}

export default Binder;

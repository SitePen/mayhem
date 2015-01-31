import BindDirection = require('./BindDirection');
import binding = require('./interfaces');
import BindingError = require('./BindingError');
import has = require('../has');
import lang = require('dojo/_base/lang');
import Promise = require('../Promise');
import util = require('../util');
import WeakMap = require('../WeakMap');

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
	private _bindingRegistry:WeakMap<{}, HashMap<binding.IBinding<any>>>;

	/**
	 * The list of Binding constructors available for use by this data binder.
	 *
	 * @get
	 */
	private _constructors:binding.IBindingConstructor[];

	/**
	 * Whether or not to use the {@link module:mayhem/Scheduler event scheduler} when creating new bindings.
	 *
	 * @get
	 * @set
	 * @default false
	 */
	private _useScheduler:boolean;

	constructor(kwArgs:Binder.KwArgs) {
		this._bindingRegistry = new WeakMap<{}, HashMap<binding.IBinding<any>>>();
		this._constructors = kwArgs.constructors || [];
		this._useScheduler = 'useScheduler' in kwArgs ? kwArgs.useScheduler : false;
	}

	/**
	 * Registers a new Binding constructor with the data binder. This method can be used to dynamically add and remove
	 * support for different bindings at runtime.
	 *
	 * @param Ctor The Binding constructor.
	 * @param index The priority of the newly added constructor. Constructors closer to zero are evaluated first.
	 * @returns A handle that can be used to remove the Binding constructor from the data binder.
	 */
	add(Ctor:binding.IBindingConstructor, index:number = Infinity):IHandle {
		var constructors = this._constructors;

		constructors.splice(index, 0, Ctor);

		return util.createHandle(function () {
			for (var i = 0, MaybeCtor:binding.IBindingConstructor; (MaybeCtor = constructors[i]); ++i) {
				if (Ctor === MaybeCtor) {
					constructors.splice(i, 1);
					break;
				}
			}

			Ctor = constructors = null;
		});
	}

	/**
	 * Creates a data binding between two objects.
	 *
	 * @param kwArgs The binding arguments for how a data binding should be created.
	 * @returns A handle that can be used to remove the binding or change its source, target, or direction.
	 */
	bind<T>(kwArgs:binding.IBindArguments):binding.IBindingHandle {
		var self = this;
		var direction = kwArgs.direction || BindDirection.TWO_WAY;
		var source:binding.IBinding<T>;
		var target:binding.IBinding<T>;
		var targetObserverHandle:IHandle;

		source = this.createBinding<T>(kwArgs.source, kwArgs.sourcePath);
		target = this.createBinding<T>(kwArgs.target, kwArgs.targetPath);

		function setTargetValue(change:binding.IChangeRecord<T>):void {
			if (!target) {
				console.debug('BUG');
				return;
			}

			target.set(change.value);
		}

		function setSourceValue(change:binding.IChangeRecord<T>):void {
			source.set && source.set(change.value);
		}

		source.observe(setTargetValue);
		setTargetValue({ value: source.get() });

		if (direction === BindDirection.TWO_WAY) {
			targetObserverHandle = target.observe(setSourceValue);
		}

		var handle:binding.IBindingHandle = {
			setSource: function (newSource:Object, newSourcePath:string = kwArgs.sourcePath):void {
				source.destroy();
				source = self.createBinding<T>(newSource, newSourcePath);

				if (has('debug')) {
					this._source = source;
				}

				source.observe(setTargetValue);
				setTargetValue({ value: source.get() });
			},
			setTarget: function (newTarget:Object, newTargetPath:string = kwArgs.targetPath):void {
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
			setDirection: function (newDirection:BindDirection):void {
				targetObserverHandle && targetObserverHandle.remove();
				if (newDirection === BindDirection.TWO_WAY) {
					targetObserverHandle = target.observe(setSourceValue);
				}
			},
			remove: function ():void {
				this.remove = function ():void {};
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
	createBinding<T>(object:Object, path:string, options:{ useScheduler?:boolean; } = {}):binding.IBinding<T> {
		var map:HashMap<binding.IBinding<any>> = this._bindingRegistry.get(object);
		if (!map) {
			map = {};
			this._bindingRegistry.set(object, map);
		}

		var binding:binding.IBinding<T>;
		if (typeof path !== 'string' || !(binding = map[path])) {
			var constructors = this._constructors;

			for (var i = 0, Binding:binding.IBindingConstructor; (Binding = constructors[i]); ++i) {
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

		return lang.delegate(binding, {
			_localObservers: [],
			destroy: function ():void {
				this.destroy = function ():void {};
				var observers = this._observers;
				var localObservers = this._localObservers;
				for (var i = 0, observer:binding.IObserver<T>; (observer = localObservers[i]); ++i) {
					util.spliceMatch(observers, observer);
				}
				this._localObservers = null;
				// NOTE: the binding is not destroyed as it may be in use by other callers (if multiple callers created
				// a binding to the same object & property)
				binding = map = null;
			},
			observe: function (observer:binding.IObserver<T>):IHandle {
				var handle:IHandle = binding.observe.apply(binding, arguments);
				var localObservers = this._localObservers;
				localObservers.push(observer);
				return util.createHandle(function () {
					util.spliceMatch(localObservers, observer);
					handle.remove();
					handle = localObservers = observer = null;
				});
			}
		});
	}

	notify(object:{}, property:string, change:binding.IChangeRecord<any>):void {
		var bindings:HashMap<binding.IBinding<any>> = this._bindingRegistry.get(object);
		if (bindings && bindings[property]) {
			bindings[property].notify(change);
		}
	}

	// TODO: Observable#observe should no longer be a thing eventually, anyone wanting to bind to such an object should
	// simply use the binder directly
	observe(object:{}, property:string, observer:binding.IObserver<any>):IHandle {
		var binding = this.createBinding(object, property);
		binding.observe(observer);
		return util.createHandle(function () {
			binding.destroy();
			binding = null;
		});
	}

	run():Promise<void> {
		// This is needed because bindings can be set up in the configuration of the app
		var constructors = this._constructors;

		function loadConstructor(index:number, moduleId:string):IPromise<void> {
			return util.getModule(moduleId).then(function (Binding:binding.IBindingConstructor):void {
				constructors.splice(index, 1, Binding);
			});
		}

		var promises:Promise<void>[] = [];

		for (var i = 0, Ctor:any; (Ctor = this._constructors[i]); ++i) {
			if (typeof Ctor === 'string') {
				promises.push(loadConstructor(i, Ctor));
			}
		}

		var promise:Promise<void> = Promise.all(promises).then(function ():void {});
		this.run = function ():Promise<void> {
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
	test(kwArgs:binding.IBindArguments):boolean {
		var sourceBindingValid:boolean = false;
		var targetBindingValid:boolean = false;

		for (var i = 0, Binding:binding.IBindingConstructor; (Binding = this._constructors[i]); ++i) {
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
		constructors:any[];
		useScheduler?:boolean;
	}
}

export = Binder;

/// <reference path="../dojo" />

import Application = require('../Application');
import BindDirection = require('./BindDirection');
import binding = require('./interfaces');
import BindingError = require('./BindingError');
import has = require('../has');
import Observable = require('../Observable');
import Promise = require('../Promise');
import util = require('../util');

/**
 * The Binder class provides a default data binder that uses Binding objects to enable binding between arbitrary
 * properties of two different objects.
 *
 * When creating a new Binder instance, a default list of Binding constructors can be provided through the
 * `constructors` argument. This list of constructors can contain functions that implement
 * {@link interface:binding.IBindingConstructor}, or module IDs that resolve to the same. When the Binder starts up,
 * any module IDs in the list will be loaded and replaced with the value of those modules.
 */
class Binder extends Observable implements binding.IBinder {
	private _app:Application;

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

	_initialize():void {
		super._initialize();
		this._useScheduler = false;
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

		return {
			remove: function ():void {
				this.remove = function ():void {};

				for (var i = 0, MaybeCtor:binding.IBindingConstructor; (MaybeCtor = constructors[i]); ++i) {
					if (Ctor === MaybeCtor) {
						constructors.splice(i, 1);
						break;
					}
				}

				Ctor = constructors = null;
			}
		};
	}

	/**
	 * Creates a data binding between two objects.
	 *
	 * @param kwArgs The binding arguments for how a data binding should be created.
	 * @returns A handle that can be used to remove the binding or change its source, target, or direction.
	 */
	bind<SourceT, TargetT>(kwArgs:binding.IBindArguments):binding.IBindingHandle {
		var self = this;

		if (!kwArgs.direction) {
			kwArgs.direction = BindDirection.TWO_WAY;
		}

		var source:binding.IBinding<SourceT, TargetT>;
		var target:binding.IBinding<TargetT, SourceT>;

		source = this.createBinding<SourceT, TargetT>(kwArgs.source, kwArgs.sourcePath, { scheduled: this._useScheduler });
		target = this.createBinding<TargetT, SourceT>(kwArgs.target, kwArgs.targetPath, { scheduled: this._useScheduler });

		source.bindTo(target);

		if (kwArgs.direction === BindDirection.TWO_WAY) {
			target.bindTo(source, { setValue: false });
		}

		var handle:binding.IBindingHandle = {
			setSource: function (newSource:Object, newSourcePath:string = kwArgs.sourcePath):void {
				source.destroy();
				source = self.createBinding<SourceT, TargetT>(newSource, newSourcePath, { scheduled: self._useScheduler });

				if (has('debug')) {
					this['_source'] = source;
				}

				source.bindTo(target);
				if (kwArgs.direction === BindDirection.TWO_WAY) {
					target.bindTo(source, { setValue: false });
				}
			},
			setTarget: function (newTarget:Object, newTargetPath:string = kwArgs.targetPath):void {
				target.destroy();
				target = self.createBinding<TargetT, SourceT>(newTarget, newTargetPath, { scheduled: self._useScheduler });

				if (has('debug')) {
					this['_target'] = target;
				}

				source.bindTo(target);
				if (kwArgs.direction === BindDirection.TWO_WAY) {
					target.bindTo(source, { setValue: false });
				}
			},
			setDirection: function (newDirection:BindDirection):void {
				target.bindTo(newDirection === BindDirection.TWO_WAY ? source : null);
			},
			remove: function ():void {
				this.remove = function ():void {};
				source.destroy();
				target.destroy();
				source = target = null;
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
	createBinding<SourceT, TargetT>(object:Object, path:string, options:{ scheduled?:boolean; } = {}):binding.IBinding<SourceT, TargetT> {
		var constructors = this._constructors;
		var app = this._app;

		function scheduled(binding:binding.IBinding<SourceT, TargetT>):binding.IBinding<SourceT, TargetT> {
			var oldSet = binding.set;
			binding.set = function (value:SourceT):void {
				var self = this;
				var args = arguments;
				// TODO: Why always schedule if it is an array?
				// TS2365
				var schedule = value instanceof Array || (<any> value) !== binding.get();

				app.get('scheduler').schedule(binding.id, schedule ? function ():void {
					oldSet.apply(self, args);
				} : null);
			};
			return binding;
		}

		var binding:binding.IBinding<SourceT, TargetT>;
		for (var i = 0, Binding:binding.IBindingConstructor; (Binding = constructors[i]); ++i) {
			if (Binding.test({ object: object, path: path, binder: this })) {
				binding = new Binding<SourceT, TargetT>({
					object: object,
					path: path,
					binder: this
				});

				return options.scheduled === false ? binding : scheduled(binding);
			}
		}

		throw new BindingError(
			'No registered binding constructors understand the requested binding "{binding}" on {object}.', {
				object: object,
				path: path,
				binder: this
			}
		);
	}

	startup():Promise<void> {
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
		this.startup = function ():Promise<void> {
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
			if (!sourceBindingValid && Binding.test({
				object: kwArgs.source,
				path: kwArgs.sourcePath,
				binder: this
			})) {
				sourceBindingValid = true;
			}

			if (!targetBindingValid && Binding.test({
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

export = Binder;

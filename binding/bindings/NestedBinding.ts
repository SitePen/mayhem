/// <reference path="../../dojo" />

import array = require('dojo/_base/array');
import binding = require('../interfaces');
import Binding = require('../Binding');
import lang = require('dojo/_base/lang');
import util = require('../../util');

var SEPARATOR:string = '.';

/**
 * The NestedBinding class enables binding to arbitrarily deep children of a source object. It can bind to properties
 * that may not exist at the time the object is initially bound, or whose parents change during the course of the
 * lifetime of the root object.
 */
class NestedBinding<SourceT, TargetT> extends Binding<SourceT, TargetT> implements binding.IBinding<SourceT, TargetT> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		return kwArgs.object != null && kwArgs.path && util.escapedIndexOf(kwArgs.path, SEPARATOR) > -1;
	}

	/**
	 * The binder to bind sub-properties with.
	 */
	private _binder:binding.IBinder;

	/**
	 * The string that identifies the sub-property to be bound.
	 */
	private _path:string[];

	/**
	 * The watch handles for each binding.
	 */
	private _bindings:binding.IBinding<any, any>[] = [];

	/**
	 * The property at the end of the bound chain of properties.
	 */
	private _source:binding.IBinding<SourceT, TargetT>;

	/**
	 * The target property.
	 */
	private _target:binding.IBinding<TargetT, any>;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		this._binder = kwArgs.binder;
		this._path = util.escapedSplit(kwArgs.path, SEPARATOR);
		this._rebind(kwArgs.object, 0);
	}

	bindTo(target:binding.IBinding<TargetT, any>, options:binding.IBindToOptions = {}):IHandle {
		this._target = target;

		if (!target) {
			return;
		}

		if (options.setValue !== false) {
			target.set(<TargetT> <any> this.get());
		}

		var self = this;
		return {
			remove: function ():void {
				this.remove = function ():void {};
				self = self._target = null;
			}
		};
	}

	destroy():void {
		this.destroy = function ():void {};

		var bindings = this._bindings;
		for (var i = 0, binding:binding.IBinding<any, any>; (binding = bindings[i]); ++i) {
			binding.destroy();
		}

		this._source = this._target = null;
	}

	get():TargetT {
		return this._source ? this._source.get() : undefined;
	}

	/**
	 * Removes and rebinds to all objects in the object chain.
	 */
	private _rebind(fromObject:Object, fromIndex:number):void {
		var bindings = this._bindings;

		// Stop watching objects that are no longer part of this binding's object chain because a parent object
		// was replaced
		array.forEach(bindings.splice(fromIndex), function (binding:binding.IBinding<any, any>):void {
			binding.destroy();
		});

		var path:string;
		var index:number = fromIndex;
		var object:any = fromObject;
		var binding:binding.IBinding<any, any>;
		var initialBind:boolean = true;

		// If any of the intermediate objects between `object` and the property we are actually binding
		// change, we need to rebind the entire object chain starting from the changed object
		for (; index < this._path.length - 1 && object; ++index) {
			path = this._path[index];
			binding = this._binder.createBinding(object, path, { scheduled: false });
			binding.bindTo(<binding.IBinding<any, any>> {
				set: lang.hitch(this, function (index:number, value:any):void {
					// The `set` method of this fake target will be immediately called by the source `property` if
					// a value exists for that property; in order to avoid this causing a premature rebinding in the
					// middle of an existing rebinding event, the `initialBind` variable is used as a guard to only
					// allow rebinding once the initial binding of the entire chain has completed
					initialBind || this._rebind(value, index + 1);
				}, index)
			});
			bindings.push(binding);

			// If there is no object here, we cannot rebind any further; presumably, at some point in the future, an
			// object will exist here and then binding can continue
			if ((object = binding.get()) == null) {
				break;
			}
			// If object is a promise resolve it and rebind
			// TODO: Should probably use an explicit syntax for resolving promises instead of doing it implicitly
			if (typeof object.then === 'function') {
				object.then((value:any):void => {
					this._rebind(value, index + 1);
				});
				return;
			}
		}

		initialBind = false;

		// If `object` exists, it will be the final object in the chain, the one on which we are actually looking
		// for values
		var value:any;
		if (object) {
			// If the values on this final object change we only need to update the value, not rebind
			// any intermediate objects
			binding = this._binder.createBinding(object, this._path[index], { scheduled: false });
			binding.bindTo(<binding.IBinding<TargetT, TargetT>> {
				set: (value:TargetT):void => {
					this._update(value);
				}
			});
			bindings.push(binding);
			value = binding.get();
		}
		else {
			binding = null;
		}

		this._source = binding;
		this._update(value);
	}

	set(value:SourceT):void {
		this._source && this._source.set(value);
	}

	/**
	 * Updates the bound target property with the given value.
	 */
	private _update(value:TargetT):void {
		this._target && this._target.set(value);
	}
}

export = NestedBinding;

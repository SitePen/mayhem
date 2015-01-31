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
class NestedBinding<T> extends Binding<T> {
	static test(kwArgs:binding.IBindingArguments):boolean {
		return kwArgs.object != null && kwArgs.path && util.escapedIndexOf(kwArgs.path, SEPARATOR) > -1;
	}

	/**
	 * The string that identifies the sub-property to be bound.
	 */
	private _path:string[];

	/**
	 * The watch handles for each binding.
	 */
	private _bindings:binding.IBinding<any>[] = [];

	/**
	 * The property at the end of the bound chain of properties.
	 */
	private _source:binding.IBinding<T>;

	constructor(kwArgs:binding.IBindingArguments) {
		super(kwArgs);

		this._binder = kwArgs.binder;
		this._path = util.escapedSplit(kwArgs.path, SEPARATOR);
		this._rebind(kwArgs.object, 0);
	}

	destroy():void {
		super.destroy();

		var bindings = this._bindings;
		for (var i = 0, binding:binding.IBinding<any>; (binding = bindings[i]); ++i) {
			binding.destroy();
		}

		this._source = this._bindings = this._path = null;
	}

	get():T {
		return this._source && this._source.get ? this._source.get() : undefined;
	}

	getObject():{} {
		return this._source ? this._source.getObject() : undefined;
	}

	/**
	 * Removes and rebinds to all objects in the object chain.
	 */
	private _rebind(fromObject:Object, fromIndex:number):void {
		var bindings = this._bindings;

		// Stop watching objects that are no longer part of this binding's object chain because a parent object
		// was replaced
		array.forEach(bindings.splice(fromIndex), function (binding:binding.IBinding<any>):void {
			binding.destroy();
		});

		var self = this;
		var path:string;
		var index:number = fromIndex;
		var object:any = fromObject;
		var binding:binding.IBinding<any>;
		var length:number = this._path.length;

		// If any of the intermediate objects between `object` and the property we are actually binding
		// change, we need to rebind the entire object chain starting from the changed object
		for (; index < length - 1 && object; ++index) {
			path = this._path[index];
			binding = this._binder.createBinding(object, path, { useScheduler: false });
			binding.observe(<binding.IObserver<any>> lang.partial(function (index:number, change:binding.IChangeRecord<T>):void {
				self._rebind(change.value, index + 1);
			}, index));
			bindings.push(binding);

			// If there is no object here, we cannot rebind any further; presumably, at some point in the future, an
			// object will exist here and then binding can continue
			if ((object = binding.get()) == null) {
				break;
			}
			// If object is a promise resolve it and rebind
			// TODO: Should probably use an explicit syntax for resolving promises instead of doing it implicitly
			if (typeof object.then === 'function') {
				object.then(function (value:any):void {
					self._rebind(value, index + 1);
				});
				return;
			}
		}

		// If `object` exists, it will be the final object in the chain, the one on which we are actually looking
		// for values
		var value:any;
		if (object) {
			// If the values on this final object change we only need to update the value, not rebind
			// any intermediate objects
			binding = this._binder.createBinding(object, this._path[index], { useScheduler: false });
			binding.observe(function (change:binding.IChangeRecord<T>):void {
				self.notify(change);
			});
			bindings.push(binding);
			value = binding.get();
		}
		else {
			binding = null;
		}

		this._source = binding;
		this.notify({ value: value });
	}

	set(value:T):void {
		this._source && this._source.set && this._source.set(value);
	}
}

export = NestedBinding;

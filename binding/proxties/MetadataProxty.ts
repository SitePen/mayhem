/// <reference path="../../dojo" />

import binding = require('../interfaces');
import BindingProxty = require('../BindingProxty');
import core = require('../../interfaces');
import lang = require('dojo/_base/lang');
import Observable = require('../../Observable');
import util = require('../../util');

/**
 * This property binder adds the ability to bind to metadata properties on instances of classes such as data/Model.
 */
class MetadataProxty<T> extends BindingProxty<T, T> implements binding.IProxty<T, T> {
	static test(kwArgs:binding.IProxtyArguments):boolean {
		var object = <core.IHasMetadata> kwArgs.object;
		return object != null && kwArgs.binding && kwArgs.binding.indexOf('!') !== -1 &&
			typeof object.getMetadata === 'function';
	}

	private _field:string;
	private _handle:IHandle;
	private _key:string;
	private _parent:binding.IProxty<any, any>;
	private _target:core.IProxty<T>;

	// TODO: this should pass the main binding string on to another proxty
	constructor(kwArgs:binding.IProxtyArguments) {
		super(kwArgs);

		var binding:string = kwArgs.binding,
			splitAt:number = binding.lastIndexOf('!');

		this._field = binding.slice(splitAt + 1);
		binding = binding.slice(0, splitAt);

		// Getting metadata is like getting a property descriptor; we need to have a reference to the parent object
		// of the key, and the key, in order to look it up
		splitAt = binding.lastIndexOf('.');
		if (splitAt > -1) {
			this._key = binding.slice(splitAt + 1);
			binding = binding.slice(0, splitAt);
		}
		else {
			this._key = binding;
			binding = '';
		}

		if (binding) {
			this._parent = kwArgs.binder.createProxty(kwArgs.object, binding);
			this._parent.observe((newObject:core.IHasMetadata):void => this._swapMetadataObject(newObject));
		}
		else {
			this._swapMetadataObject(<core.IHasMetadata> kwArgs.object);
		}
	}

	bindTo(target:core.IProxty<T>, options:binding.IBindToOptions = {}):IHandle {
		this._target = target;

		if (!target) {
			return;
		}

		if (options.setValue !== false) {
			target.set(this.get());
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
		super.destroy();

		this._handle && this._handle.remove();
		this._parent && this._parent.destroy();
		this._handle = this._parent = null;
	}

	private _swapMetadataObject(newObject:core.IHasMetadata):void {
		var newMetadata:Observable = newObject && newObject.getMetadata ? newObject.getMetadata(this._key) : null;

		this._handle && this._handle.remove();

		if (newMetadata) {
			this._handle = newMetadata.observe(this._field, (newValue:any):void => {
				this._update(newValue);
			});

			this.set(newMetadata.get(this._field));
		}
		else {
			this.set(null);
		}
	}

	private _update(value:T):void {
		this._target && this._target.set(value);
	}
}

export = MetadataProxty;

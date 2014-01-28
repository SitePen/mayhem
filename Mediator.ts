/// <reference path="./dojo" />

import arrayUtil = require('dojo/_base/array');
import core = require('./interfaces');
import declare = require('dojo/_base/declare');
import Evented = require('dojo/Evented');
import has = require('dojo/has');
import lang = require('dojo/_base/lang');
import ModelProxty = require('./data/Property');
import Observable = require('./Observable');
import Stateful = require('dojo/Stateful');
import util = require('./util');

var uuid = 0;

class Mediator extends Observable implements core.IMediator {
	[key:string]:any;
	app:core.IApplication;
	model:core.IModel;
	routeState:Object;

	constructor(kwArgs:Object = {}) {
		this.app = null;
		this.model = null;
		super(kwArgs);
	}

	get(key:string):any {
		var getter = '_' + key + 'Getter',
			value:any;

		if (getter in this) {
			value = this[getter]();
		}
		else if (key in this) {
			value = this[key];
		}
		else if (this.model) {
			value = this.model.get(key);
		}

		if (value instanceof ModelProxty) {
			return value.get();
		}

		return value;
	}

	// TODO: Fix implementation to not use getProxty
	getMetadata(key:string):core.IModelProxty<any> {
		try {
			return this.getProxty(key);
		}
		catch (error) {
			return null;
		}
	}

	// TODO: This should go away, public proxty objects are limited and should go through the data binding interface
	getProxty(key:string):core.IModelProxty<any> {
		var getter = '_' + key + 'Getter',
			value:any;

		if (getter in this) {
			value = this[getter]();
		}
		else if (key in this) {
			value = this[key];
		}
		else if (this.model) {
			value = this.model.getProxty(key);
		}

		if (!(value instanceof ModelProxty)) {
			throw new Error('No proxty available for "' + key + '"');
		}

		return value;
	}

	observe(key:string, observer:core.IObserver<any>):IHandle {
		// Prefix all keys as a simple way to avoid collisions if someone uses a name for a watch that is also on
		// `Object.prototype`
		// TODO: In ES5 we can just use `Object.create(null)` instead

		var handle:IHandle = super.observe(key, observer);

		// Keys not pre-defined on the mediator should be delegated to the model, and may change when the model
		// changes
		if (!(key in this) && !(('_' + key + 'Setter') in this)) {
			var notifier = (newValue:any, oldValue:any):void => {
					this._notify(newValue, oldValue, key);
				},
				modelPropertyHandle:IHandle,
				modelHandle:IHandle = this.observe('model', (newModel:core.IModel, oldModel:core.IModel) => {
					var oldValue:any = oldModel.get(key),
						newValue:any = newModel.get(key);

					modelPropertyHandle && modelPropertyHandle.remove();
					modelPropertyHandle = newModel.observe(key, notifier);

					if (!util.isEqual(oldValue[key], newValue[key])) {
						this._notify(newValue[key], oldValue[key], key);
					}
				});

			modelPropertyHandle = this.model && this.model.observe(key, notifier);

			var oldRemove = handle.remove;
			handle.remove = function () {
				oldRemove.apply(this, arguments);
				modelHandle.remove();
				modelPropertyHandle.remove();
			};
		}

		return handle;
	}

	set(kwArgs:Object):void;
	set(key:string, value:any):void;
	set(key:any, value?:any):void {
		if (typeof key === 'object') {
			var kwArgs:Object = key;
			for (key in kwArgs) {
				this.set(key, kwArgs[key]);
			}
		}
		else {
			var oldValue = this.get(key),
				setter = '_' + key + 'Setter',
				notify = false;

			if (setter in this) {
				notify = true;
				this[setter](value);
			}
			else if (key in this) {
				notify = true;
				this[key] && this[key].isProxty ? this[key].set(value) : (this[key] = value);
			}
			else if (this.model) {
				this.model.set(key, value);
			}
			else if (has('debug')) {
				console.warn('Attempt to set key "%s" on mediator but it has no model and no such key', key);
			}

			if (notify) {
				var newValue = this.get(key);

				if (!util.isEqual(oldValue, newValue)) {
					this._notify(newValue, oldValue, key);
				}
			}
		}
	}
}

export = Mediator;

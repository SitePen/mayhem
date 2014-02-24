/// <reference path="./dojo" />

import arrayUtil = require('dojo/_base/array');
import core = require('./interfaces');
import data = require('./data/interfaces');
import declare = require('dojo/_base/declare');
import Evented = require('dojo/Evented');
import has = require('dojo/has');
import lang = require('dojo/_base/lang');
import Property = require('./data/Property');
import Proxy = require('./Proxy');
import Observable = require('./Observable');
import Stateful = require('dojo/Stateful');
import util = require('./util');

class Mediator extends Observable implements core.IMediator, core.IHasMetadata {
	/* private */ _app:core.IApplication;
	private _model:data.IModel;

	get(key:'model'):data.IModel;
	get(key:string):any;
	get(key:string):any {
		var privateKey = '_' + key,
			getter = privateKey + 'Getter',
			value:any;

		if (getter in this) {
			value = this[getter]();
		}
		else if (privateKey in this) {
			value = this[privateKey];

			// Might be for a computed property
			// TODO: Does this make sense?
			if (value instanceof Property) {
				value = (<Property<any>> value).get('value');
			}
		}
		else {
			var model = this.get('model');
			if (model) {
				value = model.get(key);
			}
		}

		return value;
	}

	getMetadata(key:string):core.IProxy {
		var proxy:Proxy;

		// TODO: Leak?
		this.observe('model', function (newModel:data.IModel):void {
			var newProperty = newModel.getMetadata(key);
			proxy.setTarget(newProperty || null);
		});

		var model = this.get('model'),
			modelProperty = model && model.getMetadata(key);

		proxy = new Proxy(modelProperty);

		return proxy;
	}

	observe(key:string, observer:core.IObserver<any>):IHandle {
		// Prefix all keys as a simple way to avoid collisions if someone uses a name for a watch that is also on
		// `Object.prototype`
		// TODO: In ES5 we can just use `Object.create(null)` instead

		var handle:IHandle = super.observe(key, observer),
			privateKey = '_' + key;

		// Keys not pre-defined on the mediator should be delegated to the model, and may change when the model
		// changes
		if (!(privateKey in this) && !((privateKey + 'Setter') in this)) {
			var notifier = (newValue:any, oldValue:any):void => {
					this._notify(newValue, oldValue, key);
				},
				modelHandle:IHandle = this.observe('model', (newModel:data.IModel, oldModel:data.IModel):void => {
					var oldValue:any = oldModel.get(key),
						newValue:any = newModel.get(key);

					modelPropertyHandle && modelPropertyHandle.remove();
					modelPropertyHandle = newModel.observe(key, notifier);

					if (!util.isEqual(oldValue[key], newValue[key])) {
						this._notify(newValue[key], oldValue[key], key);
					}
				}),
				model:data.IModel = this.get('model'),
				modelPropertyHandle:IHandle = model && model.observe(key, notifier);

			var oldRemove = handle.remove;
			handle.remove = function ():void {
				oldRemove.apply(this, arguments);
				modelHandle.remove();
				modelPropertyHandle.remove();
			};
		}

		return handle;
	}

	set(key:'model', value:data.IModel):void;
	set(kwArgs:{ [key:string]: Object; }):void;
	set(key:string, value:any):void;
	set(key:any, value?:any):void {
		if (util.isObject(key)) {
			var kwArgs:{ [key:string]: any; } = key;
			for (key in kwArgs) {
				this.set(key, kwArgs[key]);
			}

			return;
		}

		var oldValue = this.get(key),
			privateKey = '_' + key,
			setter = privateKey + 'Setter',
			notify = false;

		if (setter in this) {
			notify = true;
			this[setter](value);
		}
		else if (privateKey in this) {
			notify = true;

			if (this[privateKey] instanceof Property) {
				this[privateKey].set(value);
			}
			else {
				this[privateKey] = value;
			}
		}
		else {
			var model = this.get('model');
			if (model) {
				model.set(key, value);
			}
			else if (has('debug')) {
				console.warn('Attempt to set key "%s" on mediator but it has no model and no such key', key);
			}
		}

		if (notify) {
			var newValue = this.get(key);

			if (!util.isEqual(oldValue, newValue)) {
				this._notify(newValue, oldValue, key);
			}
		}
	}
}

// TypeScript does not create default properties on the prototype, but they are necessary to allow these fields to be
// set at runtime and to prevent infinite recursion with the default model getter implementation (using `this.get`
// to allow accessor overrides)
lang.mixin(Mediator.prototype, {
	_app: null,
	_model: null
});

export = Mediator;

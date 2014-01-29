/// <reference path="./dojo" />

import arrayUtil = require('dojo/_base/array');
import core = require('./interfaces');
import data = require('./data/interfaces');
import declare = require('dojo/_base/declare');
import Evented = require('dojo/Evented');
import has = require('dojo/has');
import lang = require('dojo/_base/lang');
import Property = require('./data/Property');
import Observable = require('./Observable');
import Stateful = require('dojo/Stateful');
import util = require('./util');

class Mediator extends Observable implements core.IMediator, core.IHasMetadata {
	[key:string]:any;
	app:core.IApplication;
	model:data.IModel;
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

			// Might be for a computed property
			// TODO: Does this make sense?
			if (value instanceof Property) {
				value = (<Property<any>> value).get('value');
			}
		}
		else if (this.model) {
			value = this.model.get(key);
		}

		return value;
	}

	getMetadata(key:string):data.IProperty<any> {
		var property:data.IProperty<any> = new Property();

		// TODO: Leak?
		this.observe('model', function (newModel:data.IModel):void {
			var newProperty = newModel.getMetadata(key);
			if (newProperty) {
				property.set(newProperty);
			}
		});

		var modelProperty = this.model && this.model.getMetadata(key);
		if (modelProperty) {
			property.set(modelProperty);
		}

		return property;
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
				modelHandle:IHandle = this.observe('model', (newModel:data.IModel, oldModel:data.IModel) => {
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

				if (this[key] instanceof Property) {
					this[key].set(value);
				}
				else {
					this[key] = value;
				}
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

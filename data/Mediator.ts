/// <reference path="../dojo" />

import arrayUtil = require('dojo/_base/array');
import aspect = require('dojo/aspect');
import BaseModel = require('./BaseModel');
import core = require('../interfaces');
import data = require('./interfaces');
import Evented = require('dojo/Evented');
import has = require('dojo/has');
import lang = require('dojo/_base/lang');
import Property = require('./Property');
import PropertyProxy = require('./PropertyProxy');
import Observable = require('../Observable');
import Stateful = require('dojo/Stateful');
import util = require('../util');

class Mediator extends BaseModel implements data.IMediator, core.IHasMetadata {
	private _modelHandles:{ [key:string]:IHandle };
	private _model:BaseModel;

	call:data.IMediatorCall;
	get:data.IMediatorGet;
	set:data.IMediatorSet;

	constructor(kwArgs?:{ [key:string]: any; }) {
		this._modelHandles = {};

		super(kwArgs);
	}

	_modelSetter(model:any /* BaseModel */):void {
		if (model && typeof model.then === 'function') {
			// If handed a promise, set 'model' to its value
			model.then((model:any):void => this.set('model', model));
			return;
		}

		this._model = model;
	}

	_routeStateSetter(routeState:any):void {
		if (!routeState) {
			this.set('model', null);
			return;
		}

		var hasParameters = false,
			modelName:string, idValue:any, match:any[];
		for (var key in routeState) {
			if ((match = key.match(/^(.*)Id$/))) {
				modelName = match[1];
				idValue = routeState[key];
				break;
			}
			hasParameters = true;
		}

		if (hasParameters) {
			this.set('model', this.get('store').get(idValue));
		}
	}

	/* protected */ callModel(method:string, ...args:any[]):any {
		if (this._model) {
			return this._model.call.apply(this._model, arguments);
		}
	}

	getMetadata(key:string):data.IProperty<any> {
		var properties = this._getProperties(),
			property = properties[key];

		if (property) {
			return property;
		}

		var proxy:PropertyProxy<any>,
			handle:IHandle = this.observe('model', function (newModel:data.IModel):void {
				var newProperty = newModel ? newModel.getMetadata(key) : null;
				proxy.setTarget(newProperty || null);
			});

		var model = this.get('model'),
			modelProperty = model && model.getMetadata(key);

		proxy = new PropertyProxy(modelProperty);
		aspect.after(proxy, 'destroy', ():void => {
			handle.remove();
			proxy = handle = model = modelProperty = null;
		});

		return proxy;
	}

	observe(key:string, observer:core.IObserver<any>):IHandle {
		var handle:IHandle = super.observe(key, observer),
			privateKey = '_' + key;

		// Keys not pre-defined on the mediator should be delegated to the model, and may change when the model
		// changes
		if (!(privateKey in this) && !((privateKey + 'Setter') in this) && !(key in this._getProperties())) {
			var mediator = this,
				oldRemove = handle.remove;

			handle.remove = function ():void {
				oldRemove.apply(this, arguments);

				if (!mediator._observers[key].length) {
					mediator._modelHandles[key].remove();
					mediator._modelHandles[key] = null;
				}
			};

			// only set up the model notifier if it hasn't already been set up
			if (!this._modelHandles[key]) {
				var notifier = (newValue:any, oldValue:any):void => {
						this._notify(newValue, oldValue, key);
					},
					model:data.IModel = this.get('model'),
					modelPropertyHandle:IHandle = model && model.observe(key, notifier),
					modelHandle:IHandle = this.observe('model', (newModel:data.IModel, oldModel:data.IModel):void => {
						var oldValue:any = oldModel && oldModel.get(key),
							newValue:any = newModel && newModel.get(key);

						modelPropertyHandle && modelPropertyHandle.remove();
						if (newModel) {
							modelPropertyHandle = newModel.observe(key, notifier);
						}

						if (!util.isEqual(oldValue, newValue)) {
							this._notify(newValue, oldValue, key);
						}
					});

				var oldModelRemove = modelHandle.remove;
				modelHandle.remove = function ():void {
					oldModelRemove.apply(this, arguments);
					modelPropertyHandle && modelPropertyHandle.remove();
				};

				this._modelHandles[key] = modelHandle;
			}
		}

		return handle;
	}
}

// TypeScript does not create default properties on the prototype, but they are necessary to allow these fields to be
// set at runtime and to prevent infinite recursion with the default model getter implementation (using `this.get`
// to allow accessor overrides)
lang.mixin(Mediator.prototype, {
	call: function (method:string, ...args:any[]):any {
		if (this[method]) {
			return BaseModel.prototype.call.apply(this, arguments);
		}
		return this.callModel.apply(this, arguments);
	},

	get: function (key:string):any {
		var privateKey = '_' + key,
			getter = privateKey + 'Getter',
			value:any;

		if (getter in this) {
			value = this[getter]();
		}
		else {
			var property:data.IProperty<any> = this._getProperties()[key];
			if (property) {
				value = property.get('value');
			}
			else if (privateKey in this) {
				value = this[privateKey];
			}
			else {
				var model = this.get('model');
				if (model) {
					value = model.get(key);
				}
			}
		}

		return value;
	},

	set: function (key:any, value?:any):void {
		if (util.isObject(key)) {
			var kwArgs:{ [key:string]: any; } = key;
			for (key in kwArgs) {
				if (key === 'constructor') {
					continue;
				}
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
		else {
			var property:data.IProperty<any> = this._getProperty(key);
			if (property) {
				property.set('value', value);
			}
			else if (privateKey in this) {
				notify = true;
				this[privateKey] = value;
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
		}

		if (notify) {
			var newValue = this.get(key);

			if (!util.isEqual(oldValue, newValue)) {
				this._notify(newValue, oldValue, key);
			}
		}
	}
});

Mediator.defaults({
	app: null,
	model: null,
	store: null
});

export = Mediator;

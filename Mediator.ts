/// <reference path="interfaces.ts" />
/// <reference path="dojo.d.ts" />

import has = require('dojo/has');
import arrayUtil = require('dojo/_base/array');
import Notifier = require('./Notifier');

var notifier = new Notifier();

var uuid = 0;

class Mediator implements IMediator {
	app:IApplication;
	model:IModel;
	routeState:Object;

	computedProperties:{ [sourceProperty:string]:string[]; } = {};

	private _id:string;
	private _watchers:{ [ key:string ]:Array<(key:string, oldValue:any, newValue:any) => void>; } = {};

	constructor(kwArgs?:Object) {
		this._id = String(++uuid);

		// TODO: This assumes that the kwArgs object provided to the constructor defines the properties of the
		// mediator at startup. This may not be a good assumption to make, and instead everything should come
		// from the prototype only.
		for (var k in kwArgs) {
			if (k.charAt(0) === '_') {
				continue;
			}

			var setter = '_' + k + 'Setter',
				value = kwArgs[k];

			if (setter in this) {
				this[setter](value);
			}
			else {
				this[k] = value;
			}
		}
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

		return value;
	}

	set(key:any, value?:any):void {
		if (typeof key === 'object') {
			var kwArgs:Object = key;
			for (key in kwArgs) {
				// only set keys that are not annotated as being private to allow
				key.charAt(0) !== '_' && this.set(key, kwArgs[key]);
			}
		}
		else {
			var setter = '_' + key + 'Setter',
				hasSetter = setter in this;

			if (hasSetter || (key in this)) {
				var keysToNotify = [ key ].concat(this.computedProperties[key] || []),
					oldValues = arrayUtil.map(keysToNotify, function (key:string) {
						return this.get(key);
					}, this);

				if (hasSetter) {
					this[setter](value);
				}
				else {
					this[key] = value;
				}

				arrayUtil.forEach(keysToNotify, function (key:string, index:number) {
					var watchers = (this._watchers[key] || []).concat(this._watchers['*'] || []);
					if (watchers.length) {
						notifier.schedule({
							object: this,
							key: key,
							oldValue: oldValues[index],
							newValue: this.get(key),
							callbacks: watchers
						});
					}
				}, this);
			}
			else if (this.model) {
				this.model.set(key, value);
			}
			else if (has('debug')) {
				console.warn('Attempt to set key "%s" on mediator %s but it has no model and no such key', key,
					this._id);
			}
		}
	}

	watch(key:any, callback?:(key:string, oldValue:any, newValue:any) => void):IHandle {
		if (typeof key === 'function') {
			callback = key;
			key = '*';
		}

		var watchers = this._watchers[key] = (this._watchers[key] || []);
		watchers.push(callback);

		return {
			remove: function () {
				this.remove = function () {};

				// TODO: Use indexOf when upgrading to ES5
				for (var i = 0, maybeCallback; (maybeCallback = watchers[i]); ++i) {
					if (maybeCallback === callback) {
						watchers.splice(i, 1);
					}
				}

				watchers = callback = null;
			}
		};
	}

	toString() {
		return '[object Mediator(' + this._id + ')]';
	}
}

export = Mediator;

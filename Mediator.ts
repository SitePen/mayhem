/// <reference path="dojo.d.ts" />

import arrayUtil = require('dojo/_base/array');
import core = require('./interfaces');
import declare = require('dojo/_base/declare');
import Evented = require('dojo/Evented');
import has = require('dojo/has');
import Stateful = require('dojo/Stateful');
import util = require('./util');

var uuid = 0;

class Mediator implements core.IMediator {
// TODO: Needed for TS 1.0, broken for TS 0.9.1
//	[key:string]:any;
	app:core.IApplication;
	model:core.IModel;
	routeState:Object;
	private _watchers:{ [key:string]:Array<(key:string, oldValue:any, newValue:any) => void>; } = {};

	constructor(kwArgs?:Object) {
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

	set(kwArgs:Object):void;
	set(key:string, value:any):void;
	set(key:any, value?:any):void {
		if (typeof key === 'object') {
			var kwArgs:Object = key;
			for (key in kwArgs) {
				// only set keys that are not annotated as being private to allow
				key.charAt(0) !== '_' && this.set(key, kwArgs[key]);
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
					var watchers:Array<(key:string, oldValue:any, newValue:any) => void>;
					watchers = (<typeof watchers> []).concat(this._watchers['*'] || [], this._watchers['*' + key] || []);
					// TODO: Should watcher notifications be scheduled? It might be a good idea, or it might cause
					// data-binding to inefficiently take two cycles through the event loop.
					var watcher:(key:string, oldValue:any, newValue:any) => void;
					for (var i = 0; (watcher = watchers[i]); ++i) {
						watcher.call(this, key, oldValue, newValue);
					}
				}
			}
		}
	}

	watch(callback:(key:string, oldValue:any, newValue:any) => void):IHandle;
	watch(key:string, callback:(key:string, oldValue:any, newValue:any) => void):IHandle;
	watch(key:any, callback?:(key:string, oldValue:any, newValue:any) => void):IHandle {
		if (typeof key === 'function') {
			callback = key;
			key = '';
		}

		// Prefix all keys as a simple way to avoid collisions if someone uses a name for a watch that is also on
		// `Object.prototype`
		// TODO: In ES5 we can just use `Object.create(null)` instead
		key = '*' + key;

		var watchers = this._watchers[key] = (this._watchers[key] || []);
		watchers.push(callback);

		return {
			remove: function () {
				this.remove = function () {};

				util.spliceMatch(watchers, callback);
				watchers = callback = null;
			}
		};
	}
}

export = Mediator;

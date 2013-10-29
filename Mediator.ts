/// <reference path="interfaces.ts" />
/// <reference path="dojo.d.ts" />

import Stateful = require('dojo/Stateful');
import has = require('dojo/has');

// TODO: Abstract and expose as a utility function
function isEqual(a:any, b:any):boolean {
	return a === b || (/* a is NaN*/ a !== a && /* b is NaN */ b !== b);
}

// TODO: Abstract and expose notifier as a general 'event loop' interface
interface INotification {
	object:Mediator;
	key:string;
	oldValue:any;
	newValue:any;
	callbacks:Array<(key:string, oldValue:any, newValue:any) => void>;
}

var notifier = (function () {
	var timer = null,
		notifications:{ [id:string]:INotification; } = {};

	return {
		schedule: function (kwArgs:INotification) {
			var notificationId = kwArgs.object + '.' + kwArgs.key,
				notification = notifications[notificationId];

			if (notification) {
				// properties that used to be changed but now are the same again should not notify
				if (isEqual(notification.oldValue, kwArgs.newValue)) {
					notifications[notificationId] = null;
				}
				else {
					notification.newValue = kwArgs.newValue;
					// TODO: callbacks added after the set but before the notification is dispatched should not
					// receive the notification, but changes to the callback list after the initial set should be
					// accounted for? For now we just assume that the list of callbacks at the last set is the
					// correct list.
					notification.callbacks = kwArgs.callbacks;
				}
			}
			else if (!isEqual(kwArgs.oldValue, kwArgs.newValue)) {
				notifications[notificationId] = kwArgs;
			}

			if (!timer) {
				timer = setTimeout(this.dispatch, 0);
			}
		},

		dispatch: function () {
			clearTimeout(timer);
			timer = null;

			for (var k in notifications) {
				var notification = notifications[k];

				// a notification that was set and subsequently removed because the new value became the same as the
				// old value
				if (!notification) {
					continue;
				}

				for (var i = 0, callback; (callback = notification.callbacks[i]); ++i) {
					callback.call(notification.object, notification.key, notification.oldValue, notification.newValue);
				}
			}

			notifications = {};
		}
	};
})();

var uuid = 0;

class Mediator implements IMediator {
	app:IApplication;
	model:IModel;
	routeState:Object;

	private _id:string;
	private _watchers:{ [ key:string ]:Array<(key:string, oldValue:any, newValue:any) => void>; } = {};

	constructor(kwArgs?:Object) {
		this._id = String(++uuid);

		// TODO: This assumes that the kwArgs object provided to the constructor defines the properties of the
		// mediator at startup.
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
				var oldValue = this.get(key);

				if (hasSetter) {
					this[setter](value);
				}
				else {
					this[key] = value;
				}

				var watchers = this._watchers[key];

				if (watchers) {
					notifier.schedule({
						object: this,
						key: key,
						oldValue: oldValue,
						newValue: value,
						callbacks: watchers.slice(0)
					});
				}
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

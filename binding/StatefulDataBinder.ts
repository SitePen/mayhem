/// <reference path="interfaces.ts" />
/// <reference path="../interfaces.ts" />
/// <reference path="../dojo.d.ts" />

import lang = require('dojo/_base/lang');
import array = require('dojo/_base/array');
import has = require('dojo/has');

class StatefulDataBinder implements IDataBinder {
	test(kwArgs:IDataBindingArguments):boolean {
		return array.every([ 'source', 'target' ], function (objectType) {
			var object = kwArgs[objectType];
			return 'watch' in object && 'get' in object && 'set' in object;
		});
	}

	bind(kwArgs:IDataBindingArguments):IDataBindingHandle {
		// 'to' is the mediator object when used with the framework
		var target:IStateful = <IStateful> kwArgs.target,
			bindKey:string[] = kwArgs.targetBinding.split('.'),
			callbacks:Array<(value:any, oldValue:any) => void> = [],
			boundObject:IStateful,
			boundKey:string = bindKey[bindKey.length - 1],
			watchHandles:IHandle[];

		/**
		 * Ensures child data-bindings are updated when a parent object is replaced.
		 *
		 * @param object
		 * The new object bound to the key at index `i`.
		 *
		 * @param i
		 * The index of the key that has changed.
		 */
		function rebind(object:IStateful, i:number) {
			// Stop watching objects that are no longer part of this binding's object chain because a parent object
			// was replaced
			array.forEach(watchHandles.splice(i), function (handle) {
				handle.remove();
			});

			// If any of the intermediate objects between `object` and the key we are actually binding
			// change, we need to rebind the entire object chain starting from the changed object
			for (var key; (key = bindKey[i]) && i < bindKey.length - 1; ++i) {
				if (object) {
					// If the watched key changes, rebind that object
					watchHandles.push(object.watch(key, <(key, oldValue, newValue) => void> lang.partial(function (i, key, oldValue, newValue) {
						rebind(newValue, i + 1);
					}, i)));

					// If there is no object here, we cannot rebind any further; presumably, at some point in
					// the future, an object might exist here
					if (!(object = object.get(key))) {
						boundObject = null;
						break;
					}
				}
			}

			// This is the final object in the chain, the one on which we are actually looking for values
			if (object) {
				// If the values on this final object change we only need to update the value, not rebind
				// any intermediate objects
				watchHandles.push(object.watch(key, notify));

				// The bound object needs to be known so that it can be updated properly through the data binding
				// handle
				boundObject = object;

				// And of course we want to update the bound value immediately, now that one exists
				notify(key, null, object.get(key));
			}
		}

		function notify(key:string, oldValue:any, newValue:any):void {
			// avoid any possible side-effects caused by `callbacks` mutating during execution
			var _callbacks = callbacks.slice(0);

			for (var i = 0, j = _callbacks.length; i < j; ++i) {
				_callbacks[i].call(target, newValue, oldValue);
			}
		}

		rebind(target, 0);

		return {
			get to():IStateful {
				return to;
			},
			set to(value:IStateful) {
				this.remove();
				to = value;
				rebind(to, 0);
			},

			remove: function () {
				var handle:IHandle;
				for (var i = 0, j = watchHandles.length; i < j; ++i) {
					watchHandles[i].remove();
				}

				watchHandles = [];
			},

			listen: function (callback:(value:any, oldValue:any) => void):IHandle {
				callbacks.push(callback);
				return {
					remove: function () {
						this.remove = function () {};

						for (var i = 0, j = callbacks.length; i < j; ++i) {
							if (callbacks[i] === callback) {
								callbacks.splice(i, 1);
							}
						}
					}
				};
			},

			refresh: function () {
				if (boundObject) {
					notify(null, null, boundObject.get(boundKey));
				}
			},

			set: function (value:any) {
				if (boundObject) {
					boundObject.set(boundKey, value);
				}
				else if (has('debug')) {
					throw new Error('Attempting to set property ' + kwArgs.binding + ', but parent object does not exist');
				}
			}
		};
	}
}

export = StatefulDataBinder;

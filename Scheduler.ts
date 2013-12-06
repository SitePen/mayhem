/// <reference path="dojo.d.ts" />

import core = require('./interfaces');
import lang = require('dojo/_base/lang');
import util = require('./util');

function createTimer(callback:Function):IHandle {
	var timerId = setTimeout(callback, 0);
	return {
		remove: function () {
			this.remove = function () {};
			clearTimeout(timerId);
			timerId = null;
		}
	};
}

class Scheduler implements core.IScheduler {
	private _callbacks:{ [id:string]:() => void; } = {};
	private _postCallbacks:Function[] = [];
	private _timer:IHandle;
	private _dispatch:Function;

	constructor() {
		this._dispatch = lang.hitch(this, 'dispatch');
	}

	schedule(id:string, callback:() => void):IHandle {
		var callbacks = this._callbacks;
		callbacks[id] = callback;

		if (!this._timer) {
			this._timer = createTimer(this._dispatch);
		}

		return {
			remove: function () {
				this.remove = function () {};
				callbacks = id = callbacks[id] = null;
			}
		};
	}

	dispatch():void {
		this._timer.remove();
		this._timer = null;

		var callbacks = this._callbacks,
			postCallbacks = this._postCallbacks,
			callback:Function;

		// Callbacks may schedule new callbacks, which should all execute on the next loop instead of the current
		// loop, and should not conflict with existing callback IDs
		this._callbacks = {};
		this._postCallbacks = [];

		for (var k in callbacks) {
			callback = callbacks[k];

			// a callback that was scheduled and subsequently removed will be null.
			// this is done instead of deleting the key for performance. see
			// <http://kendsnyder.com/posts/chrome-v8-creators-with-and-delete-are-dog-slow>
			callback && callback();
		}

		for (var i = 0; (callback = postCallbacks[i]); ++i) {
			callback();
		}
	}

	afterNext(callback:Function):IHandle {
		var callbacks = this._postCallbacks,
			spliceMatch = util.spliceMatch;

		callbacks.push(callback);

		return {
			remove: function () {
				this.remove = function () {};
				spliceMatch(callbacks, callback);
				spliceMatch = callbacks = callback = null;
			}
		};
	}
}

export = Scheduler;

/// <reference path="interfaces.ts" />
/// <reference path="dojo.d.ts" />

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

class Scheduler implements IScheduler {
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

		var callback:Function;

		try {
			for (var k in this._callbacks) {
				callback = this._callbacks[k];

				// a callback that was scheduled and subsequently removed will be null.
				// this is done instead of deleting the key for performance. see
				// <http://kendsnyder.com/posts/chrome-v8-creators-with-and-delete-are-dog-slow>
				callback && callback();
			}

			for (var i = 0; (callback = this._postCallbacks[i]); ++i) {
				callback();
			}
		}
		finally {
			this._callbacks = {};
			this._postCallbacks = [];
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

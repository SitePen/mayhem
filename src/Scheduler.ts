import has = require('./has');
import lang = require('dojo/_base/lang');
import util = require('./util');

class Scheduler {
	private _callbacks:{ [id:string]:() => void; } = {};
	private _dispatch:() => void;
	private _postCallbacks:Array<(...args:any[]) => void> = [];
	private _timer:IHandle;

	constructor() {
		this._dispatch = lang.hitch(this, 'dispatch');
	}

	afterNext(callback:(...args:any[]) => void):IHandle {
		var callbacks = this._postCallbacks;

		callbacks.push(callback);

		return util.createHandle(function () {
			util.spliceMatch(callbacks, callback);
			callbacks = callback = null;
		});
	}

	dispatch():void {
		this._timer.remove();
		this._timer = null;

		var callbacks = this._callbacks,
			postCallbacks = this._postCallbacks,
			callback:() => void;

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

	schedule(id:string, callback:() => void):IHandle {
		if (has('debug') && !id) {
			throw new Error('Cannot schedule without an identifier');
		}

		var callbacks = this._callbacks;
		callbacks[id] = callback;

		if (!this._timer) {
			this._timer = util.createTimer(this._dispatch);
		}

		return util.createHandle(function () {
			callbacks = id = callbacks[id] = null;
		});
	}
}

export = Scheduler;

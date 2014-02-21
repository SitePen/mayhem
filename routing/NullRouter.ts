import Router = require('./Router');
import lang = require('dojo/_base/lang');

/**
 * A router implementation with no alternative backing mechanism. Change routes by calling `go`.
 */
class NullRouter extends Router {
	paused:boolean;

	/**
	 * Starts the router, using the current hash as the initial route to load. If no hash is set, the `defaultRoute`
	 * will be set as the hash and loaded.
	 */
	startup():IPromise<void> {
		var promise = super.startup();
		this._handlePathChange(this.createPath(this._defaultRoute));
		return promise;
	}

	/**
	 * Resume this router.
	 */
	resume():void {
		this.paused = false;
	}

	/**
	 * Pause this router.
	 */
	pause():void {
		this.paused = true;
	}

	/**
	 * Transition to a new route.
	 */
	go(routeId:string, kwArgs?:Object):void {
		if (this.paused) {
			throw new Error('Router is paused');
		}

		this._handlePathChange(this.createPath(routeId, kwArgs));
	}

	/**
	 * Resets the path of the underlying state mechanism without triggering a routing update.
	 */
	resetPath(path:string, replace?:boolean):void {
		this.pause();
		if (replace) {
			this._oldPath = path;
		}
		this.resume();
	}

	/**
	 * Stringifies the given arguments
	 */
	createPath(routeId:string, kwArgs?:{ [key:string]: any }) {
		return JSON.stringify({ id: routeId, kwArgs: kwArgs });
	}
}

// Default primitive property values
lang.mixin(NullRouter.prototype, {
	paused: false
});

export = NullRouter;

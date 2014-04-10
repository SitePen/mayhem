/// <reference path="../dojo" />

import Router = require('./Router');
import lang = require('dojo/_base/lang');

/**
 * A router implementation with no alternative backing mechanism. Change routes by calling `go`.
 */
class NullRouter extends Router {
	_paused:boolean;

	/**
	 * Starts the router, using the current hash as the initial route to load. If no hash is set, the `defaultRoute`
	 * will be set as the hash and loaded.
	 */
	startup():IPromise<void> {
		var promise = super.startup();
		this._handlePathChange(this.createPath(this.get('defaultRoute')));
		return promise;
	}

	/**
	 * Resume this router.
	 */
	resume():void {
		this.set('paused', false);
	}

	/**
	 * Pause this router.
	 */
	pause():void {
		this.set('paused', true);
	}

	/**
	 * Transition to a new route.
	 */
	go(routeId:string, kwArgs?:Object):void {
		if (this.get('paused')) {
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
	createPath(routeId:string, kwArgs?:{ [key:string]: any }):string {
		return JSON.stringify({ id: routeId, kwArgs: kwArgs });
	}
}

NullRouter.defaults({
	paused: false
});

export = NullRouter;

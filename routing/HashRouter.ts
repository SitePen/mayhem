/// <reference path="../dojo" />

import Deferred = require('dojo/Deferred');
import RouteEvent = require('./RouteEvent');
import Router = require('./Router');
import hash = require('dojo/hash');
import lang = require('dojo/_base/lang');
import topic = require('dojo/topic');
import when = require('dojo/when');

/**
 * A router implementation that operates using the window's location hash.
 */
class HashRouter extends Router {
	_pathPrefix:string;
	private _changeHandle:IHandle;

	/**
	 * Starts the router, using the current hash as the initial route to load. If no hash is set, the `defaultRoute`
	 * will be set as the hash and loaded.
	 */
	startup():IPromise<void> {
		return when(super.startup()).then(():void => {
			var initialRoute = hash();
			if (initialRoute) {
				this._handlePathChange(this.normalizeId(initialRoute));
			}
			else {
				try {
					hash(this.createPath(this.get('defaultRoute')), true);
				}
				catch (error) {
					this._handleNotFoundRoute(new RouteEvent({
						oldPath: '',
						newPath: this.get('defaultRoute')
					}));
				}
			}
		});
	}

	/**
	 * Starts the router responding to hash changes.
	 */
	resume():void {
		if (!this._changeHandle) {
			this._changeHandle = topic.subscribe('/dojo/hashchange', lang.hitch(this, '_handlePathChange'));
		}
	}

	/**
	 * Stops the router from responding to any hash changes.
	 */
	pause():void {
		if (this._changeHandle) {
			this._changeHandle.remove();
			this._changeHandle = null;
		}
	}

	/**
	 * Transitions to a new route.
	 */
	go(routeId:string, kwArgs?:Object):void {
		if (!this._changeHandle) {
			throw new Error('Router is paused');
		}

		// Only change hash if path is new
		var path = this.createPath(routeId, kwArgs);
		if (path !== '#' + hash()) {
			hash(path);
		}
	}

	/**
	 * Sets the hash without triggering a routing update.
	 *
	 * @param path The path to set.
	 * @param replace Whether or not to replace the previous path in history with the provided path.
	 */
	resetPath(path:string, replace?:boolean):void {
		this.pause();
		hash(path, replace);
		this.resume();
	}

	/**
	 * Creates a URL fragment that can be used to link to the given route.
	 */
	createPath(id:string, kwArgs?:Object):string {
		id = this.normalizeId(id);

		var route = this.get('routes')[id];

		if (!route) {
			throw new Error('Invalid route id "' + id + '"');
		}

		return '#' + this.get('pathPrefix') + route.serialize(kwArgs);
	}

	/**
	 * Normalizes a string to a real ID value.
	 */
	normalizeId(id:string):string {
		// TODO: If something is passing an thing that is prefixed they are probably passing the path instead, which
		// is not correct
		var prefix:string = this.get('pathPrefix');
		if (id.indexOf(prefix) === 0) {
			id = id.slice(prefix.length);
		}

		return super.normalizeId(id);
	}
}

HashRouter.defaults({
	pathPrefix: '!/'
});

export = HashRouter;

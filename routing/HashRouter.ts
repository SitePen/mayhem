/// <reference path="../dojo" />

import hash = require('dojo/hash');
import lang = require('dojo/_base/lang');
import Promise = require('../Promise');
import Route = require('./Route');
import RouteEvent = require('./RouteEvent');
import Router = require('./Router');
import topic = require('dojo/topic');

/**
 * A router implementation that operates using the window's location hash.
 */
class HashRouter extends Router {
	private _changeHandle:IHandle;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_pathPrefix:string;

	get:HashRouter.Getters;
	on:HashRouter.Events;
	set:HashRouter.Setters;

	/**
	 * Creates a URL fragment that can be used to link to the given route.
	 */
	createPath(id:string, kwArgs?:HashMap<any>):string {
		id = this.normalizeId(id);

		var route:Route = this._routes[id];

		if (!route) {
			throw new Error('Invalid route id "' + id + '"');
		}

		return '#' + this._pathPrefix + route.serialize(kwArgs);
	}

	/**
	 * Transitions to a new route.
	 */
	go(routeId:string, kwArgs?:HashMap<any>):void {
		if (!this._changeHandle) {
			throw new Error('Router is paused');
		}

		// Only change hash if path is new
		var path = this.createPath(routeId, kwArgs);
		if (path !== '#' + hash()) {
			hash(path);
		}
	}

	_handlePathChange(newPath:string):void {
		super._handlePathChange(newPath.slice(this._pathPrefix.length));
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
	 * Starts the router responding to hash changes.
	 */
	resume():void {
		if (!this._changeHandle) {
			this._changeHandle = topic.subscribe('/dojo/hashchange', lang.hitch(this, '_handlePathChange'));
		}
	}

	/**
	 * Starts the router, using the current hash as the initial route to load. If no hash is set, the `defaultRoute`
	 * will be set as the hash and loaded.
	 */
	startup():IPromise<void> {
		var self = this;
		return Promise.resolve(super.startup()).then(function ():void {
			var initialRoute = hash();
			if (initialRoute) {
				self._handlePathChange(self.normalizeId(initialRoute));
			}
			else {
				try {
					hash(self.createPath(self._defaultRoute), true);
				}
				catch (error) {
					self._handleNotFoundRoute(new RouteEvent({
						oldPath: '',
						newPath: self._defaultRoute,
						type: 'error'
					}));
				}
			}
		});
	}
}

module HashRouter {
	export interface Events extends Router.Events {}
	export interface Getters extends Router.Getters {
		(key:'pathPrefix'):string;
	}
	export interface Setters extends Router.Setters {
		(key:'pathPrefix', value:string):void;
	}
}

HashRouter.prototype._pathPrefix = '!/';

export = HashRouter;

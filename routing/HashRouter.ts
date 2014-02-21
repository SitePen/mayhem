import Deferred = require('dojo/Deferred');
import Router = require('./Router');
import hash = require('dojo/hash');
import lang = require('dojo/_base/lang');
import topic = require('dojo/topic');
import when = require('dojo/when');

/**
 * A router implementation that operates using the window's location hash.
 */
class HashRouter extends Router {
	/** A prefix that is expected to exist on all URLs loaded through this router. */
	pathPrefix:string;

	private _changeHandle:{ remove:() => void };

	/**
	 * Starts the router, using the current hash as the initial route to load. If no hash is set, the `defaultRoute`
	 * will be set as the hash and loaded.
	 */
	startup():IPromise<void> {
		return when(super.startup()).then(function () {
			var initialRoute = hash();
			if (initialRoute) {
				this._handlePathChange(this.normalizeId(initialRoute));
			}
			else {
				hash(this.createPath(this.defaultRoute), true);
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

		hash(this.createPath(routeId, kwArgs));
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

		var route = this._routes[id];

		if (!route) {
			throw new Error('Invalid route id "' + id + '"');
		}

		return '#' + this.pathPrefix + route.serialize(kwArgs);
	}

	/**
	 * Normalizes a string to a real ID value.
	 */
	normalizeId(id:string):string {
		// TODO: If something is passing an thing that is prefixed they are probably passing the path instead, which
		// is not correct
		if (id.indexOf(this.pathPrefix) === 0) {
			id = id.slice(this.pathPrefix.length);
		}

		return super.normalizeId(id);
	}
}

// Default primitive property values
lang.mixin(HashRouter.prototype, {
	pathPrefix: '!/'
});

export = HashRouter;

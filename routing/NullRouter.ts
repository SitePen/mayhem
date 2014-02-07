import Router = require('./Router');

/**
 * A router implementation with no alternative backing mechanism. Change routes by calling `go`.
 */
class NullRouter extends Router {
	paused:boolean = false;

	/**
	 * Starts the router, using the current hash as the initial route to load. If no hash is set, the `defaultRoute`
	 * will be set as the hash and loaded.
	 */
	startup():void {
		super.startup();
		this._handlePathChange(this.createPath(this.get('defaultRoute')));
	}

	resume():void {
		this.paused = false;
	}

	pause():void {
		this.paused = true;
	}

	go():void {
		if (this.paused) {
			throw new Error('Router is paused');
		}

		this._handlePathChange(this.createPath.apply(this, arguments));
	}

	resetPath(path:string):void {
		this.pause();
		this._oldPath = path;
		this.resume();
	}

	createPath(id:string, kwArgs?:{ [key:string]: any }) {
		return JSON.stringify({ id: id, kwArgs: kwArgs });
	}
}

export = NullRouter;

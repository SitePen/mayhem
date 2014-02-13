import SyntheticEvent = require('../SyntheticEvent');
import routing = require('./interfaces');

class RouteEvent extends SyntheticEvent {
	/** @readonly */
	oldPath:string;

	/** @readonly */
	newPath:string;

	/** @readonly */
	canceled:boolean;

	/** @readonly */
	paused:boolean;

	/** @readonly */
	router:routing.IRouter;

	constructor(kwArgs:Object) {
		super();
		for (var k in kwArgs) {
			this[k] = kwArgs[k];
		}
	}

	/**
	 * Reverts the path state on the router to the pre-event path.
	 */
	pause():void {
		this.router.resetPath(this.oldPath, true);
	}

	/**
	 * Sets the path state on the router back to the post-event path.
	 */
	resume():void {
		if (this.canceled) {
			return;
		}

		this.router.resetPath(this.newPath);
	}

	/**
	 * Reverts the path state on the router when the route event is cancelled.
	 */
	preventDefault():void {
		// if paused, the path was already changed back to the old path and does not need to be changed again
		if (!this.paused) {
			this.router.resetPath(this.oldPath, true);
		}
	}
};

export = RouteEvent;

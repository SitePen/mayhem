import Event = require('../Event');
import routing = require('./interfaces');

class RouteEvent extends Event {
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

	/**
	 * Reverts the path state on the router to the pre-event path.
	 */
	pause():void {
		this.paused = true;
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
		this.paused = false;
	}

	/**
	 * Cancels the event
	 *
	 * TODO: What exactly does this entail?
	 */
	cancel():void {
		this.canceled = true;
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

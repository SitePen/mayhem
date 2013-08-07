define([], function () {

	function RouteEvent(kwArgs) {
		for (var k in kwArgs) {
			this[k] = kwArgs[k];
		}
	}

	RouteEvent.prototype = {
		constructor: RouteEvent,
		oldPath: null,
		newPath: null,
		router: null,

		pause: function () {
			//	summary:
			//		Reverts the path state on the router to the pre-event path.

			this.router.resetPath(this.oldPath, true);
		},

		resume: function () {
			//	summary:
			//		Sets the path state on the router back to the post-event path.

			if (this.canceled) {
				return;
			}

			this.router.resetPath(this.newPath);
		},

		preventDefault: function () {
			//	summary:
			//		Reverts the path state on the router when the route event is cancelled.

			// if paused, the path was already changed back to the old path and does not need to be changed again
			if (!this.paused) {
				this.router.resetPath(this.oldPath, true);
			}
		}
	};

	return RouteEvent;
});

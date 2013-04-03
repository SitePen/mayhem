define([
	'dojo/_base/declare',
	'dojo/json',
	'./Router'
], function (declare, JSON, Router) {
	return declare(Router, {
		//	summary:
		//		A router implementation with no alternative backing mechanism. Change routes by calling `go`.

		paused: false,

		startup: function () {
			//	summary:
			//		Starts the router, using the current hash as the initial route to load. If no hash is set, the
			//		`defaultRoute` will be set as the hash and loaded.

			this.inherited(arguments);
			this._handlePathChange(this.createPath(this.defaultRoute));
		},

		resume: function () {
			this.paused = false;
		},

		pause: function () {
			this.paused = true;
		},

		go: function () {
			if (this.paused) {
				throw new Error('Router is paused');
			}

			this._handlePathChange(this.createPath.apply(this, arguments));
		},

		resetPath: function (/**string*/ path) {
			this.pause();
			this._oldPath = path;
			this.resume();
		},

		createPath: function (/**string*/ id, /**Object*/ kwArgs) {
			return JSON.stringify({ id: id, kwArgs: kwArgs });
		}
	});
});
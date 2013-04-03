define([
	'dojo/Deferred'
], function (Deferred) {
	function PausableEvented() {
		this._events = {};
	}

	PausableEvented.prototype = {
		constructor: PausableEvented,
		on: function (type, listener) {
			var self = this,
				listeners = this._events[type] = (this._events[type] || []);

			listeners.push(listener);

			return {
				remove: function () {
					if (!listeners) {
						return;
					}

					for (var i = 0, retainedListener; (retainedListener = listeners[i]); ++i) {
						if (retainedListener === listener) {
							listeners.splice(i, 1);
							break;
						}
					}

					if (listeners.length === 0) {
						delete self._events[type];
					}

					self = listeners = retainedListener = listener = null;
				}
			};
		},
		emit: function (type, event) {
			//	returns: dojo/promise/Promise

			var dfd = new Deferred(),
				listeners = this._events[type];

			if (!listeners) {
				dfd.resolve();
				return dfd.promise;
			}

			var self = this,
				paused = false,
				i = 0;

			event = event || {};

			var oldPause = event.pause;
			event.pause = function () {
				// Pausing an event is the same as cancelling an event if you never call resume on it, so do not allow
				// pausing of non-cancelable events
				if (!this.pausable || !this.cancelable || this.paused) {
					return;
				}

				this.paused = true;
				oldPause && oldPause.apply(this, arguments);
			};

			var oldResume = event.resume;
			event.resume = function () {
				if (!this.paused) {
					return;
				}

				this.paused = false;
				oldResume && oldResume.apply(this, arguments);

				// it is possible that someone paused and then resumed synchronously from within the same listener,
				// so only continue the queue if we actually left a listener
				if (paused) {
					paused = false;
					run();
				}
			};

			var oldPreventDefault = event.preventDefault;
			event.preventDefault = function () {
				if (!this.cancelable || this.canceled) {
					return;
				}

				this.canceled = true;
				oldPreventDefault && oldPreventDefault.apply(this, arguments);
			};

			function run() {
				var listener;
				while ((listener = listeners[i++])) {
					listener.call(self, event);

					if (event.paused) {
						paused = true;
						return;
					}
				}

				dfd.resolve(event);
			}

			run();

			return dfd.promise;
		}
	};

	return PausableEvented;
});
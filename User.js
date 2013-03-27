define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/aspect',
	'dojo/when',
	'./Component'
], function (declare, lang, aspect, when, Component) {
	return declare(Component, {
		_emitAfterPromise: function (methodName, successEvent, failureEvent) {
			// summary:
			//    Aspects after the given method, setting up a handler which emits one
			//    of the two given events depending on whether the promise returned by
			//    the method resolves or rejects. Uses dojo/when to also support
			//    immediate values.

			aspect.after(this, methodName, function (promiseOrValue) {
				var self = this;

				// Use when just in case authenticate isn't a promise (unlikely)
				when(promiseOrValue, function (response) {
					self.emit(successEvent, response);
				}, function (error) {
					self.emit(failureEvent, error);
				});

				return promiseOrValue;
			});
		},

		startup: function () {
			if (this._started) {
				return;
			}
			
			// Hook up logic to emit events after authenticate and logout
			this._emitAfterPromise('authenticate', 'login', 'loginfail');
			this._emitAfterPromise('logout', 'logout', 'logoutfail');
		},

		authenticate: function () {
			// summary:
			//		Method to be implemented by modules extending this one,
			//		responsible for submitting an authentication request.
			// returns:
			//		A promise resolving if/when the authentication request succeeds,
			//		or rejecting if/when it fails.
		},

		logout: function () {
			// summary:
			//		Method to be implemented by modules extending this one,
			//		responsible for issuing any necessary requests and clearing any
			//		authentication information as appropriate.
			// returns:
			//		Optionally may return a promise if an asynchronous request is
			//		involved in the logout procedure.
		}
	});
});
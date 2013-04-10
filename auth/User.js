define([
	'dojo/_base/declare',
	'../has',
	'../Component'
], function (declare, has, Component) {
	return declare(Component, {
		//	summary:
		//		An abstract base class for managing user authentication and authorization.

		//	isAuthenticated: boolean
		//		Whether or not the current user is authenticated.
		isAuthenticated: false,

		//	state: Object?
		//		User-specific data about the currently authenticated user.
		state: null,

		login: function () {
			//	summary:
			//		Performs a login for the current user. If successful, the user object is set to authenticated
			//		and its state property is updated with the data returned by the `authenticate` method.
			//		Data passed to the `login` method is arbitrary based on the needs of an implementation and is
			//		simply passed through to the `authenticate` method.
			//	returns: dojo/promise/Promise

			var self = this;

			return this.authenticate.apply(this, arguments).then(function (userData) {
				self.set({
					isAuthenticated: true,
					state: userData
				});
				return userData;
			});
		},

		authenticate: function () {
			//	summary:
			//		An abstract method that should be implemented by subclasses wishing to provide
			//	returns: dojo/promise/Promise
			//		A promise that resolves with an object containing user information when authentication is
			//		successful, or rejects with an appropriate error message when authentication is unsuccessful.

			if (has('debug')) {
				throw new Error('Abstract method "authenticate" not implemented');
			}
		},

		logout: function () {
			//	summary:
			//		Performs a logout of the current user by clearing the authenticated flag and state information.

			this.set({
				isAuthenticated: false,
				state: null
			});
		},

		checkAccess: function () {
			//	summary:
			//		Checks whether or not the current user has access to perform the given operation.
			//	operation: string
			//		The name of the operation.
			//	kwArgs: Object
			//		Additional parameters used to validate the operation.
			//	returns: boolean|dojo/promise/Promise
			//		A boolean corresponding to whether or not the user is authorized to complete the given operation.
			//		If asynchronous access control checks are required, the method should return a promise instead that
			//		resolves to a boolean true or false.
		},

		get: function (/**string*/ key) {
			//	summary:
			//		Attempts to retrieve user data from the defined state object if the property being retrieved does
			//		not exist on the User object.
			//	returns: any

			return key in this || '_' + key + 'Getter' in this ? this.inherited(arguments) :
				(this.state ? this.state[key] : null);
		},

		set: function (/**string*/ key, value) {
			//	summary:
			//		Sets properties on the defined state object if the property being modified does not exist on the
			//		User object.

			if (typeof key !== 'string' || key in this || '_' + key + 'Setter' in this) {
				this.inherited(arguments);
			}
			else if (this.state) {
				this.state[key] = value;
			}
		}
	});
});
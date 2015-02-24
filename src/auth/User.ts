import lang = require('dojo/_base/lang');
import has = require('../has');
import Observable = require('../Observable');

/**
 * An abstract base class for managing user authentication and authorization.
 */
class User extends Observable {
	get:User.Getters;
	set:User.Setters;

	/**
	 * Whether or not the current user is authenticated. @protected
	 */
	_isAuthenticated:boolean;

	/**
	 * User-specific data about the currently authenticated user. @protected
	 */
	_state:Object;

	/**
	 * Performs a login for the current user. If successful, the user object is set to authenticated and its state
	 * property is updated with the data returned by the `authenticate` method. Data passed to the `login` method is
	 * arbitrary based on the needs of an implementation and is simply passed through to the `authenticate` method.
	 *
	 * @param kwArgs Parameters used to login this User.
	 *
	 * @returns a Promise that resolves with an object containing the user information.
	 */
	login(kwArgs:Object):IPromise<Object> {
		return this.authenticate.apply(this, arguments).then((userData:Object):Object => {
			this.set({
				isAuthenticated: true,
				state: userData
			});
			return userData;
		});
	}

	/**
	 * An abstract method that should be implemented by subclasses.
	 *
	 * @param kwArgs Parameters used to authenticate this User.
	 *
	 * @returns a Promise that resolves with an object containing user information when authentication is successful, or
	 * rejects with an appropriate error message when authentication is unsuccessful.
	 */
	authenticate(kwArgs:Object):IPromise<Object> {
		if (has('debug')) {
			throw new Error('Abstract method "authenticate" not implemented');
		}
		return null;
	}

	/**
	 * Performs a logout of the current user by clearing the authenticated flag and state information.
	 */
	logout():void {
		this.set({
			isAuthenticated: false,
			state: null
		});
	}

	/**
	 * Checks whether or not the current user has access to perform the given operation.
	 *
	 * @param operation The name of the operation.
	 * @param kwArgs Additional parameters used to validate the operation.
	 *
	 * @returns A boolean corresponding to whether or not the user is authorized to complete the given operation. If
	 * asynchronous access control checks are required, the method should return a Promise instead that resolves to a
	 * boolean true or false.
	 */
	checkAccess(operation:string, kwArgs?:Object):any {
		return true;
	}
}

User.prototype._isAuthenticated = false;

module User {
	export interface Getters extends Observable.Getters {
		(key:'isAuthenticated'):boolean;
		(key:'state'):Object;
	}

	export interface Setters extends Observable.Setters {
		(key:'isAuthenticated', value:boolean):void;
		(key:'state', value:Object):void;
	}
}

export = User;

import Base from '../Base';
import has from '../has';
import Promise from '../Promise';

/**
 * An abstract base class for managing user authentication and authorization.
 */
class User extends Base {
	/**
	 * Whether or not the current user is authenticated.
	 */
	isAuthenticated: boolean;

	/**
	 * User-specific data about the currently authenticated user.
	 */
	state: {};

	protected initialize() {
		super.initialize();
		this.isAuthenticated = false;
		this.state = null;
	}

	/**
	 * Performs a login for the current user. If successful, the user object is set to authenticated and its state
	 * property is updated with the data returned by the `authenticate` method. Data passed to the `login` method is
	 * arbitrary based on the needs of an implementation and is simply passed through to the `authenticate` method.
	 *
	 * @param kwArgs Parameters used to login this User.
	 *
	 * @returns a Promise that resolves with an object containing the user information.
	 */
	login(...args: any[]): Promise<{}> {
		return this.authenticate.apply(this, arguments).then((userData: {}) => {
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
	authenticate(...args: any[]): Promise<{}> {
		if (has('debug')) {
			throw new Error('Abstract method "authenticate" not implemented');
		}
		return null;
	}

	/**
	 * Performs a logout of the current user by clearing the authenticated flag and state information.
	 */
	logout(): void {
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
	 * @returns A Promise instead that resolves to a boolean true or false depending upon whether the user is
	 * authorised to perform the given action.
	 */
	checkAccess(operation: string, kwArgs?: {}): Promise<boolean> {
		return Promise.resolve(true);
	}

	/**
	 * Checks whether or not the current user has access to perform the given operation.
	 *
	 * @param operation The name of the operation.
	 * @param kwArgs Additional parameters used to validate the operation.
	 *
	 * @returns A boolean corresponding to whether or not the user is authorized to complete the given operation.
	 */
	checkAccessSync(operation: string, kwArgs?: {}): boolean {
		return true;
	}
}

export default User;

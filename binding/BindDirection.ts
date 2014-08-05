/**
 * DataBindingDirection defines constants that represent possible values for the `direction` property of a
 * {@link interface:mayhem/binding.IBindArguments bind arguments object}.
 */
enum DataBindingDirection {
	/**
	 * Create a one-way binding from source to target.
	 */
	ONE_WAY = 1,

	/**
	 * Create a two-way binding between the source and the target.
	 */
	TWO_WAY = 2
}

export = DataBindingDirection;

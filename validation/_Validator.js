define([
	"dojo/_base/declare"
], function (declare) {
	return declare(null, {
		//	summary:
		//		The interface definition for all model validators.

		//	options: Object
		//		A hash map of options for the validator to use when deciding
		//		whether or not the given value is valid. All validators may
		//		accept the following options:
		//		* allowEmpty (boolean?): If true, and the value of the field is
		//			null, undefined, or empty string, the validator will be
		//			skipped.
		//		* scenarios (string[]?): If provided, and the current `scenario`
		//			property of the model being validated does not match any
		//			of the listed scenarios, the validator will be skipped.
		options: {},

		constructor: function (options) {
			this.options = options;
		},

		validate: function () {
			//	summary:
			//		The function that must be implemented by all validators
			//		which is called to validate a field of a data model. This
			//		function accepts up to three arguments.
			//	model: mayhem/model/_Model
			//		The object being validated.
			//	key: string
			//		The name of the field being validated.
			//	value: any
			//		The value of the field being validated.
			//	returns: boolean
			//		If `false` is returned, all other validators for the given
			//		field will be skipped. Otherwise, return nothing.
		}
	});
});

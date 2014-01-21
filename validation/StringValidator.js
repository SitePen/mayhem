define([
	"dojo/_base/declare",
	"dojo/i18n!../nls/validator",
	"./_Validator",
	"./ValidationError"
], function (declare, i18n, _Validator, ValidationError) {
	return declare(_Validator, {
		//	summary:
		//		Ensures that the value is a valid string.

		//	options: Object
		//		This validator supports the following additional options:
		//		* minLength (number?): If provided, the value must be longer
		//			than this number.
		//		* maxLength (number?): If provided, the value must be shorter
		//			than this number.
		//		* regExp (RegExp?): If provided, the value must match this
		//			regular expression.
		//		* regExpFailureMessage (string?): If provided, this will be
		//			used in place of the normal regular expression failure
		//			message so a more human-friendly error can be used.
		/*===== options: {}, =====*/

		validate: function (model, key, value) {
			var options = this.options;

			value = "" + value;

			if (options.minLength != null && value.length < options.minLength) {
				model.addError(key, new ValidationError(i18n.stringTooShort, { minLength: options.minLength }));
			}

			if (options.maxLength != null && value.length > options.maxLength) {
				model.addError(key, new ValidationError(i18n.stringTooLong, { maxLength: options.maxLength }));
			}

			if (options.regExp && !options.regExp.test(value)) {
				model.addError(key, new ValidationError(options.regExpFailureMessage || i18n.stringNotMatchingRegExp, { regExp: options.regExp.toString() }));
			}
		}
	});
});

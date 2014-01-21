define([
	"dojo/_base/declare",
	"dojo/i18n!../nls/validator",
	"./_Validator",
	"./ValidationError"
], function (declare, i18n, _Validator, ValidationError) {
	return declare(_Validator, {
		//	summary:
		//		Ensures that the value is a valid number.

		//	options: Object
		//		This validator supports the following additional options:
		//		* min (number?): If provided, the value must be larger than this
		//			number.
		//		* max (number?): If provided, the value must be smaller than
		//			this number.
		//		* integerOnly (boolean?): If true, the value must be an integer.
		/*===== options: {}, =====*/

		validate: function (model, key, value) {
			var options = this.options;

			if (isNaN(value)) {
				model.addError(key, new ValidationError(i18n.notANumber));
				return;
			}

			if (options.integerOnly && parseInt(value, 10) !== value) {
				model.addError(key, new ValidationError(i18n.notAnInteger));
			}

			if (options.min != null && value < options.min) {
				model.addError(key, new ValidationError(i18n.numberTooSmall, { min: options.min }));
			}

			if (options.max != null && value > options.max) {
				model.addError(key, new ValidationError(i18n.numberTooLarge, { max: options.max }));
			}
		}
	});
});

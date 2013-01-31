define([
	"dojo/_base/declare",
	"dojo/date/locale",
	"dojo/i18n!../nls/validator",
	"./_Validator",
	"./ValidationError"
], function (declare, locale, i18n, _Validator, ValidationError) {
	return declare(_Validator, {
		//	summary:
		//		Ensures that the value is a valid date.

		//	options: Object
		//		This validator supports the following additional options:
		//		* min (Date?): If provided, the value must be after this Date.
		//			Date.
		//		* max (Date?): If provided, the value must be before this Date.
		/*===== options: {}, =====*/

		validate: function (model, key, value) {
			var options = this.options;

			if (!value instanceof Date) {
				value = new Date(Date.parse(value));
			}

			if (isNaN(value.valueOf())) {
				model.addError(key, new ValidationError(i18n.notADate));
				return;
			}

			model[key] = value;

			if (options.min && value < options.min) {
				model.addError(key, new ValidationError(i18n.dateTooSmall, { min: locale.format(options.min) }));
			}

			if (options.max && value > options.max) {
				model.addError(key, new ValidationError(i18n.dateTooLarge, { max: locale.format(options.max) }));
			}
		}
	});
});
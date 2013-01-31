define([
	"dojo/_base/declare",
	"dojo/i18n!../nls/validator",
	"./_Validator",
	"./ValidationError"
], function (declare, i18n, _Validator, ValidationError) {
	return declare(_Validator, {
		//	summary:
		//		Ensures that the value is not missing.

		validate: function (model, key, value) {
			if (value == null || value === "") {
				model.addError(key, new ValidationError(i18n.required));
			}
		}
	});
});
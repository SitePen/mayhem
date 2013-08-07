define([
	"dojo/_base/lang",
	"dojo/errors/create",
	"dojo/string",
	"dojo/i18n!../nls/validator"
], function (lang, createError, stringUtil, i18n) {
	function ValidationError(message, options) {
		this.options = options;
	}

	return createError("ValidationError", ValidationError, Error, {
		toString: function (options) {
			var dictionary = lang.mixin({ name: i18n.genericFieldName }, this.options, options);
			return stringUtil.substitute(this.message, dictionary);
		}
	});
});

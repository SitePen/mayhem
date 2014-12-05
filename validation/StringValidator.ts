import data = require('../data/interfaces');
import ValidationError = require('./ValidationError');
import Validator = require('./Validator');

// TODO
var i18n = {
	stringTooShort: 'String too short',
	stringTooLong: 'String too long',
	stringNotMatchingRegExp: 'String does not match pattern'
};

/**
 * A validator that ensure that a valid is a valid string.
 */
class StringValidator extends Validator {
	options:StringValidator.IOptions;

	validate(model:data.IModel, key:string, value:any):void {
		var options = this.options;

		value = String(value);

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
}

module StringValidator {
	export interface IOptions extends Validator.IOptions {
		/**
		 * If provided, the value must be at least this many characters long.
		 */
		minLength?:number;

		/**
		 * If provided, the value must be no more than this many characters long.
		 */
		maxLength?:number;

		/**
		 * If provided, the value must match this regular expression.
		 */
		regExp?:RegExp;

		/**
		 * If provided, this will be used in place of the normal regular expression failure message so a more
		 * human-friendly error can be used.
		 */
		regExpFailureMessage?:string;
	}
}

export = StringValidator;

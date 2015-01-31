import data = require('../data/interfaces');
import locale = require('dojo/date/locale');
import ValidationError = require('./ValidationError');
import Validator = require('./Validator');

// TODO
var i18n = {
	notADate: 'Not a date',
	dateTooSmall: 'Date too small',
	dateTooLarge: 'Date too large'
};

/**
 * Ensures that the value is a valid date.
 */
class DateValidator extends Validator {
	options:DateValidator.IOptions;

	validate(model:data.IModel, key:string, value:any):void {
		var options = this.options;

		if (!(value instanceof Date)) {
			value = new Date(Date.parse(value));
		}

		if (isNaN(value.valueOf())) {
			model.addError(key, new ValidationError(i18n.notADate));
			return;
		}

		// TS7017
		(<any> model)[key] = value;

		if (options.min && value < options.min) {
			model.addError(key, new ValidationError(i18n.dateTooSmall, { min: locale.format(options.min) }));
		}

		if (options.max && value > options.max) {
			model.addError(key, new ValidationError(i18n.dateTooLarge, { max: locale.format(options.max) }));
		}
	}
}

module DateValidator {
	export interface IOptions extends Validator.IOptions {
		/**
		 * If provided, the value must be on or after this Date.
		 */
		min?:Date;

		/**
		 * If provided, the value must be on or before this Date.
		 */
		max?:Date;
	}
}

export = DateValidator;

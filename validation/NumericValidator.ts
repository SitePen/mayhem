import data = require('../data/interfaces');
import ValidationError = require('./ValidationError');
import Validator = require('./Validator');

// TODO
var i18n = {
	notANumber: 'Not a number',
	notAnInteger: 'Not an integer',
	numberTooSmall: 'Number too small',
	numberTooLarge: 'Number too large'
};

/**
 * Ensures that the value is a valid number.
 */
class NumericValidator extends Validator {
	options:NumericValidator.IOptions;

	validate(model:data.IModel, key:string, value:any):void {
		var options = this.options;

		value = Number(value);

		if (isNaN(value)) {
			model.addError(key, new ValidationError(i18n.notANumber));
			return;
		}

		if (options.integerOnly && Math.floor(value) !== value) {
			model.addError(key, new ValidationError(i18n.notAnInteger));
		}

		if (options.min != null && value < options.min) {
			model.addError(key, new ValidationError(i18n.numberTooSmall, { min: options.min }));
		}

		if (options.max != null && value > options.max) {
			model.addError(key, new ValidationError(i18n.numberTooLarge, { max: options.max }));
		}
	}
}

module NumericValidator {
	export interface IOptions extends Validator.IOptions {
		/**
		 * If provided, the value must be greater or equal to this number.
		 */
		min?:number;

		/**
		 * If provided, the value must be smaller or equal to this number.
		 */
		max?:number;

		/**
		 * If `true`, the value must be an integer.
		 */
		integerOnly?:boolean;
	}
}

export = NumericValidator;

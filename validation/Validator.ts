import data = require('../data/interfaces');

class Validator {
	options:Validator.IOptions;

	constructor(options:typeof Validator.prototype.options = {}) {
		this.options = options;
	}

	/**
	 * The function that must be implemented by all validators
	 * which is called to validate a field of a data model. This
	 * function accepts up to three arguments.
	 *
	 * @param {module:mayhem/data/Model} model The object being validated.
	 * @param {string} key The name of the field being validated.
	 * @param {any} value The value of the field being validated.
	 * @returns {boolean} If `false` is returned, all other validators for the given field will be skipped.
	 * Otherwise, return nothing.
	 */
	validate(model:data.IModel, key:string, value:any):void {}
}

module Validator {
	/**
	 * A hash map of options for the validator to use when deciding
	 * whether or not the given value is valid.
	 */
	export interface IOptions {
		/**
		 * If true, and the value of the field is
		 * null, undefined, or empty string, the validator will be
		 * skipped.
		 */
		allowEmpty?:boolean;

		/**
		 * If provided, and the current `scenario` property of the model being validated does not match any
		 * of the listed scenarios, the validator will be skipped.
		 */
		scenarios?:string[];
	}
}

export = Validator;

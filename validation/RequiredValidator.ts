import data = require('../data/interfaces');
import ValidationError = require('./ValidationError');
import Validator = require('./Validator');

var i18n = {
	required: 'TODO field required error message'
};

class RequiredValidator extends Validator {
	validate(model:data.IModel, key:string, value:any):void {
		if (value == null || value === '') {
			model.addError(key, new ValidationError(i18n.required));
		}
	}
}

export = RequiredValidator;

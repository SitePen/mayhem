import data = require('../data/interfaces');
import i18n = require('./i18n');
import ValidationError = require('./ValidationError');
import Validator = require('./Validator');

class RequiredValidator extends Validator {
	validate(model:data.IModel, key:string, value:any):void {
		if (value == null || value === '') {
			model.addError(key, new ValidationError(i18n.required({ field: model.get('labels')[key] })));
		}
	}
}

export = RequiredValidator;

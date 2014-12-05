import data = require('../data/interfaces');
import ValidationError = require('./ValidationError');
import Validator = require('./Validator');

// TODO
var i18n = {
	required: function (kwArgs:{}) {
		return 'Field is required';
	}
};

class RequiredValidator extends Validator {
	validate(model:data.IModel, key:string, value:any):void {
		if (value == null || value === '' || /* isNaN */ value !== value) {
			model.addError(key, new ValidationError(i18n.required({ field: model.get('labels')[key] })));
		}
	}
}

export = RequiredValidator;

import * as data from '../data/interfaces';
import ValidationError from './ValidationError';
import Validator from './Validator';

// TODO
var i18n = {
	required: function (kwArgs: {}) {
		return 'Field is required';
	}
};

class RequiredValidator extends Validator {
	validate(model: data.IModel, key: string, value: any): void {
		if (value == null || value === '' || /* isNaN */ value !== value) {
			var labels = model.get('labels') || {};
			model.addError(key, new ValidationError(i18n.required({ field: labels[key] || key })));
		}
	}
}

export default RequiredValidator;

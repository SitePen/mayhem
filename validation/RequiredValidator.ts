import core = require('../interfaces');
import ValidationError = require('./ValidationError');


var i18n = {
	required: 'TODO field required error message'
};


class RequiredValidator implements core.IValidator {
	
	// TODO we need a way to define return as boolean | IPromise<boolean> (union types?)
	validate(model:any/*IModel*/, key:string, value:any):void {
		if (value == null || value == "") {
			model.addError(key, new ValidationError(i18n.required));
		}
		return undefined;
	}
}

export = RequiredValidator;

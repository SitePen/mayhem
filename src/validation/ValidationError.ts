import createError = require('dojo/errors/create');
import { mixin, replace } from 'dojo/_base/lang';

// TODO
var i18n = {
	genericFieldName: 'Field'
};

interface ValidationError extends Error {
	options: { [key: string]: any; };
	toString(options?: { [key: string]: any; }): string;
}

var ValidationError: {
	new (message: string, options?: { [key: string]: any; }): ValidationError;
	prototype: ValidationError;
};

function Ctor(message: string, options?: { [key: string]: any; }): void {
	this.options = options;
}

ValidationError = createError('ValidationError', Ctor, Error, {
	toString: function (options?: { [key: string]: any; }): string {
		var dictionary = mixin({ name: i18n.genericFieldName }, this.options, options);
		return replace(this.message, dictionary);
	}
});

export default ValidationError;

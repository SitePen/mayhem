import * as binding from './interfaces';
import createError = require('dojo/errors/create');
import { replace } from 'dojo/_base/lang';

interface BindingError extends Error {
	kwArgs: binding.IBindingArguments;
}

var BindingError: {
	new (message: string, kwArgs: binding.IBindingArguments): BindingError;
	prototype: BindingError;
};

function Ctor(message: string, kwArgs: binding.IBindingArguments) {
	if (!message) {
		message = 'Could not create Binding object for "{path}" on {object}.';
	}

	this.message = replace(message, kwArgs);
	this.kwArgs = kwArgs;
}

BindingError = createError('BindingError', Ctor, Error, {});

export default BindingError;

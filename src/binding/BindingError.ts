import binding = require('./interfaces');
import createError = require('dojo/errors/create');
import lang = require('dojo/_base/lang');

interface BindingError extends Error {
	kwArgs:binding.IBindingArguments;
}

var BindingError:{
	new (message:string, kwArgs:binding.IBindingArguments):BindingError;
	prototype:BindingError;
};

function Ctor(message:string, kwArgs:binding.IBindingArguments):void {
	if (!message) {
		message = 'Could not create Binding object for "{path}" on {object}.';
	}

	this.message = lang.replace(message, kwArgs);
	this.kwArgs = kwArgs;
}

BindingError = createError('BindingError', Ctor, Error, {});

export = BindingError;

/// <reference path="../dojo" />
import binding = require('./interfaces');
import createError = require('dojo/errors/create');
import lang = require('dojo/_base/lang');

interface BindingError extends Error {
	kwArgs:binding.IProxtyArguments;
}

var BindingError:{
	new (message:string, kwArgs:binding.IProxtyArguments):BindingError;
};

function Ctor(message:string, kwArgs:binding.IProxtyArguments) {
	if (!message) {
		this.message = 'Could not create proxty for "{binding}" on {object}.';
	}

	this.kwArgs = kwArgs;
}

BindingError = createError('BindingError', Ctor, Error, {
	toString: function ():string {
		return lang.replace(this.message, this.kwArgs);
	}
});

export = BindingError;

/// <reference path="../dojo" />

import createError = require('dojo/errors/create');
import lang = require('dojo/_base/lang');

var i18n = {
	genericFieldName: 'TODO lol'
};

interface ValidationError extends Error {
	options:{ [key:string]:any; };
	toString(options?:{ [key:string]:any; }):string;
}

var ValidationError:{
	new (message:string, options?:{ [key:string]:any; }):ValidationError;
};

function Ctor(message:string, options?:{ [key:string]:any; }) {
	this.options = options;
}

ValidationError = createError('ValidationError', Ctor, Error, {
	toString: function (options?:{ [key:string]:any; }):string {
		var dictionary = lang.mixin({ name: i18n.genericFieldName }, this.options, options);
		return lang.replace(this.message, dictionary);
	}
});

export = ValidationError;

/// <reference path="interfaces.ts" />
/// <reference path="../dojo.d.ts" />

import lang = require('dojo/_base/lang');

class BindingError implements Error {
	name:string = 'BindingError';
	message:string = 'Could not bind from "{sourceBinding}" on {source} to "{targetBinding}" on {target}. {message}';

	constructor(message:string, public binding:IDataBindingArguments) {
		if (message) {
			this.message = message;
		}
	}

	toString():string {
		return this.name + ': ' + lang.replace(this.message, this.binding);
	}
}

export = BindingError;

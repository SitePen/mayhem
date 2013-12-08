import binding = require('./interfaces');
import lang = require('dojo/_base/lang');

// TODO: This class is not currently used?
class BindingError implements Error {
	message:string = 'Could not bind from "{sourceBinding}" on {source} to "{targetBinding}" on {target}. {message}';
	name:string = 'BindingError';

	constructor(message:string, public binding:binding.IDataBindingArguments) {
		if (message) {
			this.message = message;
		}
	}

	toString():string {
		return this.name + ': ' + lang.replace(this.message, this.binding);
	}
}

export = BindingError;

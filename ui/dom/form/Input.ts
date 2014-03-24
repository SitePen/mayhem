import Control = require('./Control');

class Input extends Control {}

Input.implementation({
	nameMap: {
		readonly: 'readOnly'
	}
});

export = Input;

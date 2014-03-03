import Control = require('./Control');

/* abstract */ class Input extends Control {
	name:string;
	readOnly:boolean; // TODO: readonly
}

export = Input;

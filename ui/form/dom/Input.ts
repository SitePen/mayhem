import Control = require('./Control');

class Input extends Control {
}

Input.delegate(Control, '_dijitRename', {
	readonly: 'readOnly'
});

export = Input;

import DijitButton = require('dijit/form/Button');
import DijitWidget = require('../DijitWidget');

class FormButton extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(DijitButton);
		this._setDijitFields('name', 'type');
		this._setDijitActions('onClick');
		super(kwArgs);
	}
}

export = FormButton;

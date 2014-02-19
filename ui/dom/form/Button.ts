import __Button = require('dijit/form/Button');
import DijitWidget = require('../DijitWidget');

class FormButton extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__Button);
		this._setDijitFields('name', 'type');
		this._setDijitActions('onClick');
		super(kwArgs);
	}
}

export = FormButton;

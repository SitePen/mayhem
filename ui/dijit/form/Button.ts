import __Button = require('dijit/form/Button');
import Dijit = require('../Dijit');

class Button extends Dijit {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__Button);
		this._setDijitFields('name', 'type');
		this._setDijitActions('onClick');
		super(kwArgs);
	}
}

export = Button;

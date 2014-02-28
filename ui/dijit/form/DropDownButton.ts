import Dijit = require('../Dijit');
import _DijitCtor = require('dijit/form/DropDownButton');
import Button = require('./Button');
import util = require('../../../util');

class DropDownButton extends Button {
	private _dropDown:Dijit;

	constructor(kwArgs:Object = {}) {
		util.deferSetters(this, [ 'dropDown' ], '_render');
		super(kwArgs);
	}

	_dropDownSetter(dropDown:Dijit):void {
		this._dropDown = dropDown;
		this._dijit.set('dropDown', this._dropDown._dijit);
	}
}

DropDownButton.prototype._DijitCtor = _DijitCtor;
DropDownButton.prototype._dijitWidgetFields = [ 'dropDown' ];
DropDownButton.prototype._dijitRequiredFields = [ 'dropDown' ];

export = DropDownButton;

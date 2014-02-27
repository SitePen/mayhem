import Dijit = require('../Dijit');
import __DropDownButton = require('dijit/form/DropDownButton');
import Button = require('./Button');
import ui = require('../../interfaces');
import util = require('../../../util');

class DropDownButton extends Button {
	private _dropDown:Dijit;

	constructor(kwArgs:Object = {}) {
		util.deferSetters(this, [ 'dropDown' ], '_render');
		this._setDijitCtor(__DropDownButton);
		super(kwArgs);
	}

	_dropDownSetter(dropDown:Dijit):void {
		this._dropDown = dropDown;
		this._dijit.set('dropDown', this._dropDown._dijit);
	}

	_startup():void {
		if (!this._dropDown) {
			throw new Error('Dijit dropdown widget requires a `dropDown` property');
		}
		super._startup()
	}
}

export = DropDownButton;

import Dijit = require('./Dijit');
import MenuItem = require('./MenuItem');
import __PopupMenuItem = require('dijit/PopupMenuItem');
import ui = require('../interfaces');
import util = require('../../util');

class PopupMenuItem extends MenuItem {
	private _popup:Dijit;

	constructor(kwArgs:Object = {}) {
		util.deferSetters(this, [ 'popup' ], '_render');
		this._setDijitCtor(__PopupMenuItem);
		super(kwArgs);
	}

	_popupSetter(popup:Dijit):void {
		this._popup = popup;
		this._dijit.set('popup', this._popup._dijit);
	}

	_startup():void {
		if (!this._popup) {
			throw new Error('Dijit popup widget requires a `popup` property');
		}
		super._startup()
	}
}

export = PopupMenuItem;

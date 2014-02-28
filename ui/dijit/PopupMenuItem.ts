import Dijit = require('./Dijit');
import _DijitCtor = require('dijit/PopupMenuItem');
import MenuItem = require('./MenuItem');
import util = require('../../util');

class PopupMenuItem extends MenuItem {
	private _popup:Dijit;

	constructor(kwArgs:Object = {}) {
		util.deferSetters(this, [ 'popup' ], '_render');
		super(kwArgs);
	}

	_popupSetter(popup:Dijit):void {
		this._popup = popup;
		this._dijit.set('popup', this._popup._dijit);
	}
}

PopupMenuItem.prototype._DijitCtor = _DijitCtor;
PopupMenuItem.prototype._dijitWidgetFields = [ 'popup' ];
PopupMenuItem.prototype._dijitRequiredFields = [ 'popup' ];

export = PopupMenuItem;

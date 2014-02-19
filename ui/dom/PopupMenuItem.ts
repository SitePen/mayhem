import DomContainer = require('./Container');
import DijitWidget = require('./DijitWidget');
import MenuItem = require('./MenuItem');
import __PopupMenuItem = require('dijit/PopupMenuItem');
import util = require('../../util');
import widgets = require('../interfaces');

class PopupMenuItem extends MenuItem {
	private _popup:DijitWidget;

	constructor(kwArgs:Object = {}) {
		util.deferSetters(this, [ 'popup' ], '_render');
		this._setDijitCtor(__PopupMenuItem);
		super(kwArgs);
	}

	_childrenSetter(children:widgets.IDomWidget[]):void {
		// Use last child of content as popup
		// TODO: there has to be a better way
		if (children.length === 1 && !(children[0] instanceof DijitWidget)) {
			var content = <DomContainer> children[0];
			var length:number = content._children && content._children.length;
			if (length) {
				var popup:DijitWidget = <DijitWidget> content._children[length - 1];
				content.remove(popup);
				this.set('popup', popup);
			}	
		}
		super._childrenSetter(children);
	}

	_popupSetter(popup:DijitWidget):void {
		this._popup = popup;
		this._dijit.set('popup', this._popup._dijit);
	}
}

export = PopupMenuItem;

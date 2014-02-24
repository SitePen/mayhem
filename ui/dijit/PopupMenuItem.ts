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

	_childrenSetter(children:ui.IDomWidget[]):void {
		// We need to grab a child widget to use for popup
		// If only child is Element use its last child, otherwise use last child
		var elementChild:boolean = children.length === 1 && !(children[0] instanceof Dijit);
		var widgets:ui.IDomWidget[] = elementChild && children[0].get('children') || children;
		var target:Dijit = <Dijit> widgets.pop();
		target && this.set('popup', target);
		super._childrenSetter(children);
	}

	_popupSetter(popup:Dijit):void {
		this._popup = popup;
		this._dijit.set('popup', this._popup._dijit);
	}
}

export = PopupMenuItem;

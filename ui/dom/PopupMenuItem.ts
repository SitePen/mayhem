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
		// We need to grab a child widget to use for popup
		// If only child is Element use its last child, otherwise use last child
		var elementChild:boolean = children.length === 1 && !(children[0] instanceof DijitWidget);
		var widgets:widgets.IDomWidget[] = elementChild && children[0].get('children') || children;
		var target:DijitWidget = <DijitWidget> widgets.pop();
		target && this.set('popup', target);
		super._childrenSetter(children);
	}

	_popupSetter(popup:DijitWidget):void {
		this._popup = popup;
		this._dijit.set('popup', this._popup._dijit);
	}
}

export = PopupMenuItem;

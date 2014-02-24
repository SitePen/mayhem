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

	_childrenSetter(children:ui.IDomWidget[]):void {
		// We need to grab a child widget to use for dropdown
		// If only child is Element use its last child, otherwise use last child
		var elementChild:boolean = children.length === 1 && !(children[0] instanceof Dijit);
		var widgets:ui.IDomWidget[] = elementChild && children[0].get('children') || children;
		var target:Dijit = <Dijit> widgets.pop();
		target && this.set('dropDown', target);
		super._childrenSetter(children);
	}

	_dropDownSetter(dropDown:Dijit):void {
		this._dropDown = dropDown;
		this._dijit.set('dropDown', this._dropDown._dijit);
	}
}

export = DropDownButton;

import DomContainer = require('../Container');
import DijitWidget = require('../DijitWidget');
import __DropDownButton = require('dijit/form/DropDownButton');
import FormButton = require('./Button');
import util = require('../../../util');
import widgets = require('../../interfaces');

class FormDropDownButton extends FormButton {
	private _dropDown:DijitWidget;

	constructor(kwArgs:Object = {}) {
		util.deferSetters(this, [ 'dropDown' ], '_render');
		this._setDijitCtor(__DropDownButton);
		super(kwArgs);
	}

	_childrenSetter(children:widgets.IDomWidget[]):void {
		// We need to grab a child widget to use for dropdown
		// If only child is Element use its last child, otherwise use last child
		var elementChild:boolean = children.length === 1 && !(children[0] instanceof DijitWidget);
		var widgets:widgets.IDomWidget[] = elementChild && children[0].get('children') || children;
		var target:DijitWidget = <DijitWidget> widgets.pop();
		target && this.set('dropDown', target);
		super._childrenSetter(children);
	}

	_dropDownSetter(dropDown:DijitWidget):void {
		this._dropDown = dropDown;
		this._dijit.set('dropDown', this._dropDown._dijit);
	}
}

export = FormDropDownButton;

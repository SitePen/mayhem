/// <reference path="../../../dojo" />

import DomContainer = require('../Container');
import DijitDropDownButton = require('dijit/form/DropDownButton');
import DijitWidget = require('../DijitWidget');
import FormButton = require('./Button');
import util = require('../../../util');
import widgets = require('../../interfaces');

class FormDropDownButton extends FormButton {
	/* protected */ _dijit:DijitDropDownButton;
	private _dropDown:DijitWidget;

	constructor(kwArgs:Object = {}) {
		util.deferSetters(this, [ 'dropDown' ], '_render');
		this._setDijitCtor(DijitDropDownButton);
		super(kwArgs);
	}

	_childrenSetter(children:widgets.IDomWidget[]):void {
		// Use last child of content as dropDown
		// TODO: there has to be a better way
		if (children && children.length === 1) {
			var content = <DomContainer> children[0];
			var length:number = content._children && content._children.length;
			if (length) {
				var dropDown:DijitWidget = <DijitWidget> content._children[length - 1];
				content.remove(dropDown);
				this.set('dropDown', dropDown);
			}	
		}
		super._childrenSetter(children);
	}

	_dropDownSetter(dropDown:DijitWidget):void {
		this._dropDown = dropDown;
		this._dijit.set('dropDown', this._dropDown._dijit);
	}
}

export = FormDropDownButton;

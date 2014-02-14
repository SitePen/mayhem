/// <reference path="../../../dojo" />

import DijitButton = require('dijit/form/Button');
import DijitContainer = require('../DijitContainer');
import util = require('../../../util');
import widgets = require('../../interfaces');

class FormButton extends DijitContainer {
	/* protected */ _dijit:DijitButton;

	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(DijitButton);
		this._setDijitFields('name', 'type');
		this._setDijitActions('onClick');
		super(kwArgs);
	}

	_childrenSetter(children:widgets.IDomWidget[]) {
		// TODO: use all children for button content, just using first child for now
		
		super._childrenSetter(children);
	}

	_contentSetter(content:widgets.IDomWidget) {

		this._dijit.containerNode.appendChild(content.detach());
	}
}

export = FormButton;

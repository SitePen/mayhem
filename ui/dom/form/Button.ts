/// <reference path="../../../dojo" />

import Button = require('dijit/form/Button');
import DijitWidget = require('../DijitWidget');
import util = require('../../../util');
import widgets = require('../../interfaces');

class FormButton extends DijitWidget {
	/* protected */ _dijit:Button;
	content:widgets.IDomWidget;
	label:string;
	_onClick:string;
	type:string;

	constructor(kwArgs:Object = {}) {
		util.deferSetters(this, [ 'content', 'label', 'onClick', 'type' ], '_render');
		super(kwArgs);
	}

	_contentSetter(widget:widgets.IDomWidget):void {
		// TODO: add to containerNode?
	}

	/* protected */ _render():void {
		this._dijit = new Button({
			onClick: (event:Event):void => { this.__onClick(event); }
		});
		super._render();
	}

	_labelSetter(label:string):void {
		this.label = label;
		this._dijit.set('label', label);
	}

	__onClick(event:Event):void {
		this.get('mediator')[this._onClick](event);
	}

	_onClickSetter(value:string):void {
		this._onClick = value;
	}

	_typeSetter(type:string):void {
		this.type = type;
		this._dijit.set('type', type);
	}
}

export = FormButton;

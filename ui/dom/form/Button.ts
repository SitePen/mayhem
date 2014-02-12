/// <reference path="../../../dojo" />

import Button = require('dijit/form/Button');
import DijitWidget = require('../DijitWidget');
import util = require('../../../util');
import widgets = require('../../interfaces');

class FormButton extends DijitWidget {
	/* protected */ _dijit:Button;
	_content:widgets.IDomWidget;
	_iconClass:string;
	_label:string;
	_onClick:string;
	_type:string;

	constructor(kwArgs:Object = {}) {
		util.deferSetters(this, [ 'content', 'label', 'onClick', 'type' ], '_render');
		super(kwArgs);
	}

	_contentSetter(widget:widgets.IDomWidget):void {
		this._content = widget;
		this._dijit.containerNode.appendChild(widget.detach());
	}

	_labelSetter(label:string):void {
		this._label = label;
		this._dijit.set('label', label);
	}

	__onClick(event:Event):void {
		var method:(event:Event) => void = this.get('mediator')[this._onClick];
		method && method(event);
	}

	_onClickSetter(method:string):void {
		this._onClick = method;
	}

	/* protected */ _render():void {
		this._dijit = new Button({
			iconClass: this._iconClass,
			id: this._dijitId,
			onClick: (event:Event):void => { this.__onClick(event); }
		});
		super._render();
	}

	_typeSetter(type:string):void {
		this._type = type;
		this._dijit.set('type', type);
	}
}

export = FormButton;

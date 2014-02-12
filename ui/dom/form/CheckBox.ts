/// <reference path="../../../dojo" />

import CheckBox = require('dijit/form/CheckBox');
import DijitWidget = require('../DijitWidget');
import util = require('../../../util');
import widgets = require('../../interfaces');

class FormCheckBox extends DijitWidget {
	_checked:boolean; // TODO: coerce
	/* protected */ _dijit:CheckBox;
	_label:string;
	_onClick:string;
	_value:any;

	constructor(kwArgs:Object = {}) {
		util.deferSetters(this, [ 'checked', 'label', 'onClick', 'value' ], '_render');
		super(kwArgs);
	}

	_checkedSetter(checked:boolean):void {
		this._checked = checked;
		this._dijit.set('checked', checked);
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
		this._dijit = new CheckBox({
			id: this._dijitId,
			onClick: (event:Event):void => { this.__onClick(event); }
		});
		super._render();
	}

	_valueSetter(value:any):void {
		this._value = value;
		this._dijit.set('value', value);
	}
}

export = FormCheckBox;

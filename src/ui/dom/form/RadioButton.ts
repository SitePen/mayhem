import DijitRadioButton = require('dijit/form/RadioButton');
import DijitWidget = require('../DijitWidget');
import domConstruct = require('dojo/dom-construct');
import domUtil = require('../util');
import IRadioButton = require('../../form/RadioButton');
import MultiNodeWidget = require('../MultiNodeWidget');
import util = require('../../../util');

class RadioButton extends MultiNodeWidget implements IRadioButton {
	static Ctor = DijitRadioButton;
	static setupMap = util.deepCreate(DijitWidget.setupMap, {
		properties: {
			isChecked: 'checked'
		}
	});

	get:RadioButton.Getters;
	on:RadioButton.Events;
	set:RadioButton.Setters;

	protected _isChecked:boolean;
	protected _checkedValue:any;
	protected _formattedLabel:string;
	protected _isDisabled:boolean;
	protected _isFocused:boolean;
	protected _label:string;
	protected _labelNode:HTMLElement;
	protected _value:any;
	protected _widget:DijitRadioButton;

	protected _isCheckedGetter():boolean {
		return this._isChecked;
	}
	protected _isCheckedSetter(isChecked:boolean):void {
		this._isChecked = isChecked;

		if (isChecked) {
			this.set('value', this._checkedValue);
		}
	}

	protected _formattedLabelGetter():string {
		return this._formattedLabel;
	}
	protected _formattedLabelSetter(value:string):void {
		domUtil.extractContents(this._labelNode, this._labelNode, true);

		var content:DocumentFragment = <any> domConstruct.toDom(value);

		var oldLabelValue:string = this._label;
		this._label = content.textContent || (<any> content).innerText;

		this._labelNode.appendChild(content);
		this._formattedLabel = value;

		this._notify('label', this._label, oldLabelValue);
	}

	_isAttachedGetter():boolean {
		return DijitWidget.prototype._isAttachedGetter.call(this);
	}
	_isAttachedSetter(value:boolean):void {
		DijitWidget.prototype._isAttachedSetter.call(this, value);
	}

	_isFocusedGetter():boolean {
		return DijitWidget.prototype._isFocusedGetter.call(this);
	}
	_isFocusedSetter(value:boolean):void {
		DijitWidget.prototype._isFocusedSetter.call(this);
	}

	protected _labelGetter():string {
		return this._label;
	}
	protected _labelSetter(value:string):void {
		this.set('formattedLabel', util.escapeXml(value));
	}

	protected _valueGetter():any {
		return this._value;
	}
	protected _valueSetter(value:any):void {
		this._value = value;

		var isChecked = value === this._checkedValue;
		if (this._isChecked !== isChecked) {
			this.set('isChecked', value === this._checkedValue);
		}
	}

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'isChecked', 'formattedLabel', 'label', 'value' ], '_render');
		super(kwArgs);
	}

	_initialize():void {
		super._initialize();
		this._isChecked = false;
		this._value = null;
		this._isDisabled = false;
	}

	_render():void {
		super._render();

		DijitWidget.prototype._render.call(this);
		(<any> this)._node = null;
		this._fragment.insertBefore(this._widget.domNode, this._lastNode);

		var labelNode = document.createElement('label');
		labelNode.htmlFor = (<any> this._widget).id;

		this._fragment.insertBefore(labelNode, this._lastNode);
		this._labelNode = labelNode;
	}

	destroy():void {
		super.destroy();

		DijitWidget.prototype.destroy.call(this);
	}
}

module RadioButton {
	export interface Events extends DijitWidget.Events, IRadioButton.Events {}
	export interface Getters extends DijitWidget.Getters, IRadioButton.Getters {}
	export interface Setters extends DijitWidget.Setters, IRadioButton.Setters {}
}

export = RadioButton;

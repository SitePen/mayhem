/// <reference path="../../../dijit" />

import CheckboxValue = require('../../form/CheckboxValue');
import DijitCheckbox = require('dijit/form/CheckBox');
import DijitWidget = require('../DijitWidget');
import ICheckbox = require('../../form/Checkbox');
import util = require('../../../util');

class Checkbox extends DijitWidget implements ICheckbox {
	static Ctor = DijitCheckbox;
	static setupMap = util.deepCreate(DijitWidget.setupMap, {
		properties: {
			checked: 'checked'
		}
	});

	get:Checkbox.Getters;
	on:Checkbox.Events;
	set:Checkbox.Setters;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_checked:boolean;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_value:CheckboxValue;

	_checkedSetter(value:boolean):void {
		this.set('value', value ? CheckboxValue.TRUE : CheckboxValue.FALSE);
	}

	_valueSetter(value:CheckboxValue):void {
		this._value = value;

		// Setting checked directly would make it impossible to set the indeterminate value
		var oldChecked = this._checked;
		this._checked = value === CheckboxValue.TRUE ? true : false;
		this._notify('checked', this._checked, oldChecked);
	}
}

Checkbox.prototype._checked = false;
Checkbox.prototype._value = CheckboxValue.FALSE;

module Checkbox {
	export interface Events extends DijitWidget.Events, ICheckbox.Events {}
	export interface Getters extends DijitWidget.Getters, ICheckbox.Getters {}
	export interface Setters extends DijitWidget.Setters, ICheckbox.Setters {}
}

export = Checkbox;

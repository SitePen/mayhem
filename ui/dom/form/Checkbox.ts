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

	_checkedGetter():boolean {
		return this.get('value') === CheckboxValue.TRUE;
	}
	_checkedSetter(value:boolean):void {
		this.set('value', value ? CheckboxValue.TRUE : CheckboxValue.FALSE);
	}

	_render():void {
		super._render();
		// Mayhem’s `activate` event occurs either on the DOM `keyup` or the DOM `mouseup` event, which is before the
		// DOM `click` event. As a result, a data binding change caused by the Mayhem `activate` event will cause the
		// value of the to change, and then the DOM `click` event will fire and Dijit will incorrectly change the
		// internal value of the checkbox back.
		// Prevent this by turning the DOM `click` into a noop and listen for the Mayhem `activate` event to toggle
		// the checkbox.
		(<any> this._widget)._onClick = function ():void {};

		this.on('activate', function ():void {
			this.set('checked', !this.get('checked'));
		});
	}

	_valueGetter():CheckboxValue {
		return this._value;
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

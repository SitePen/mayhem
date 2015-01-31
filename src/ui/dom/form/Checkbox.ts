import CheckboxValue = require('../../form/CheckboxValue');
import DijitCheckbox = require('dijit/form/CheckBox');
import DijitWidget = require('../DijitWidget');
import ICheckbox = require('../../form/Checkbox');
import util = require('../../../util');

class Checkbox extends DijitWidget implements ICheckbox {
	static Ctor = DijitCheckbox;
	static setupMap = util.deepCreate(DijitWidget.setupMap, {
		properties: {
			isChecked: 'checked'
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
	_isChecked:boolean;

	/**
	 * @get
	 * @set
	 * @protected
	 */
	_value:CheckboxValue;

	destroy() {
		super.destroy();
	}

	_isCheckedGetter():boolean {
		return this.get('value') === CheckboxValue.TRUE;
	}
	_isCheckedSetter(value:boolean):void {
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
		(<any> this._widget)._onClick = function (event:Event):void {
			event.preventDefault();
		};

		this.on('activate', function ():void {
			this.set('isChecked', !this.get('isChecked'));
		});
	}

	_valueGetter():CheckboxValue {
		return this._value;
	}
	_valueSetter(value:CheckboxValue):void {
		if (value === this._value) {
			return;
		}

		this._value = value;

		// Setting checked directly would make it impossible to set the indeterminate value
		var oldChecked = this._isChecked;
		this._isChecked = value === CheckboxValue.TRUE ? true : false;
		this._notify('isChecked', this._isChecked, oldChecked);
	}
}

Checkbox.prototype._isChecked = false;
Checkbox.prototype._value = CheckboxValue.FALSE;

module Checkbox {
	export interface Events extends DijitWidget.Events, ICheckbox.Events {}
	export interface Getters extends DijitWidget.Getters, ICheckbox.Getters {}
	export interface Setters extends DijitWidget.Setters, ICheckbox.Setters {}
}

export = Checkbox;

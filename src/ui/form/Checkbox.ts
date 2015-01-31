/// <amd-dependency path="../dom/form/Checkbox" />

import CheckboxValue = require('./CheckboxValue');
import has = require('../../has');
import Widget = require('../Widget');

interface Checkbox extends Widget {
	get:Checkbox.Getters;
	on:Checkbox.Events;
	set:Checkbox.Setters;
}

module Checkbox {
	export interface Events extends Widget.Events {}
	export interface Getters extends Widget.Getters {
		(key:'isChecked'):boolean;
		(key:'isDisabled'):boolean;
		(key:'value'):CheckboxValue;
	}
	export interface Setters extends Widget.Setters {
		(key:'isChecked', value:boolean):void;
		(key:'isDisabled', value:boolean):void;
		(key:'value', value:CheckboxValue):void;
	}
}

var Checkbox:{
	new (kwArgs:HashMap<any>):Checkbox;
	prototype:Checkbox;
};

if (has('host-browser')) {
	Checkbox = <typeof Checkbox> require('../dom/form/Checkbox');
}

export = Checkbox;

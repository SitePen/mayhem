/// <amd-dependency path="../dom/form/RadioButton" />

import Checkbox = require('./Checkbox');
import has = require('../../has');

interface RadioButton extends Checkbox {
	get:RadioButton.Getters;
	on:RadioButton.Events;
	set:RadioButton.Setters;
}

module RadioButton {
	export interface Events extends Checkbox.Events {}
	export interface Getters extends Checkbox.Getters {
		(key:'checkedValue'):any;
		(key:'formattedLabel'):string;
		(key:'label'):string;
		(key:'value'):any;
	}
	export interface Setters extends Checkbox.Setters {
		(key:'checkedValue', value:any):void;
		(key:'formattedLabel', value:string):void;
		(key:'label', value:string):void;
		(key:'value', value:any):void;
	}
}

var RadioButton:{
	new (kwArgs:HashMap<any>):RadioButton;
	prototype:RadioButton;
};

if (has('host-browser')) {
	RadioButton = <typeof RadioButton> require('../dom/form/RadioButton');
}

export = RadioButton;

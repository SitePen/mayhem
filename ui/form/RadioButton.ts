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
		(key:'name'):string;
		(key:'value'):boolean;
	}
	export interface Setters extends Checkbox.Setters {
		(key:'name', value:string):void;
		(key:'value', value:boolean):void;
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

/// <amd-dependency path="./dom/RadioButton" />

import BaseEvent = require('../../Event');
import Checkbox = require('./Checkbox');
import core = require('../../interfaces');
import has = require('../../has');

interface RadioButton extends Checkbox {
	get:RadioButton.Getters;
	on:RadioButton.Events;
	set:RadioButton.Setters;
}

module RadioButton {
	export interface Events extends Checkbox.Events {}
	export interface Getters extends Checkbox.Getters {}
	export interface Setters extends Checkbox.Setters {}
}

var RadioButton:{
	new (kwArgs:HashMap<any>):RadioButton;
	prototype:RadioButton;
};

if (has('host-browser')) {
	RadioButton = <typeof RadioButton> require('./dom/RadioButton');
}

export = RadioButton;

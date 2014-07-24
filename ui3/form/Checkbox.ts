/// <amd-dependency path="./dom/Checkbox" />

import BaseEvent = require('../../Event');
import core = require('../../interfaces');
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
		(key:'value'):boolean;
	}
	export interface Setters extends Widget.Setters {
		(key:'value', value:boolean):void;
	}
}

var Checkbox:{ new (kwArgs:HashMap<any>):Checkbox; };

if (has('host-browser')) {
	Checkbox = <typeof Checkbox> require('./dom/Checkbox');
}

export = Checkbox;

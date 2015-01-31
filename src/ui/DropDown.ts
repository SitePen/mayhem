/// <amd-dependency path="./dom/DropDown" />

import has = require('../has');
import Widget = require('./Widget');

interface DropDown extends Widget {
	get:DropDown.Getters;
	on:DropDown.Events;
	set:DropDown.Setters;
}

module DropDown {
	export interface Events extends Widget.Events {}

	export interface Getters extends Widget.Getters {
		(key:'children'):[ Widget, Widget ];
		(key:'dropDown'):Widget;
		(key:'isOpen'):boolean;
		(key:'label'):Widget;
	}

	export interface Setters extends Widget.Setters {
		(key:'dropDown', value:Widget):void;
		(key:'isOpen', value:boolean):void;
		(key:'label', value:Widget):void;
	}
}

var DropDown:{
	new (kwArgs:HashMap<any>):DropDown;
	prototype:DropDown;
};

if (has('host-browser')) {
	DropDown = <typeof DropDown> require('./dom/DropDown');
}

export = DropDown;

/// <amd-dependency path="../dom/form/DatePicker" />

import has = require('../../has');
import Widget = require('../Widget');

interface DatePicker extends Widget {
	get:DatePicker.Getters;
	on:DatePicker.Events;
	set:DatePicker.Setters;
}

module DatePicker {
	export interface Events extends Widget.Events {}

	export interface Getters extends Widget.Getters {
		(key:'max'):Date;
		(key:'min'):Date;
		(key:'placeholder'):string;
		(key:'value'):Date;
	}

	export interface Setters extends Widget.Setters {
		(key:'max', value:Date):void;
		(key:'min', value:Date):void;
		(key:'placeholder', value:string):void;
		(key:'value', value:Date):void;
	}
}

var DatePicker:{
	new (kwArgs:HashMap<any>):DatePicker;
	prototype:DatePicker;
};

if (has('host-browser')) {
	DatePicker = <typeof DatePicker> require('../dom/form/DatePicker');
}

export = DatePicker;

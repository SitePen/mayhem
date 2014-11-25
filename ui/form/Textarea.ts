/// <amd-dependency path="../dom/form/Textarea" />

import has = require('../../has');
import Widget = require('../Widget');

interface Textarea extends Widget {
	get:Textarea.Getters;
	on:Textarea.Events;
	set:Textarea.Setters;
}

module Textarea {
	export interface Events extends Widget.Events {}

	export interface Getters extends Widget.Getters {
		(key:'placeholder'):string;
		(key:'value'):string;
	}

	export interface Setters extends Widget.Setters {
		(key:'placeholder', value:string):void;
		(key:'value', value:string):void;
	}
}

var Textarea:{
	new (kwArgs:HashMap<any>):Textarea;
	prototype:Textarea;
};

if (has('host-browser')) {
	Textarea = <typeof Textarea> require('../dom/form/Textarea');
}

export = Textarea;

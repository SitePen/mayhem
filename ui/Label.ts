/// <amd-dependency path="./dom/Label" />

import has = require('../has');
import Widget = require('./Widget');

interface Label extends Widget {
	get:Label.Getters;
	on:Label.Events;
	set:Label.Setters;
}

module Label {
	export interface Events extends Widget.Events {}

	export interface Getters extends Widget.Getters {
		(key:'formattedText'):string;
		(key:'text'):string;
	}

	export interface Setters extends Widget.Setters {
		(key:'formattedText', value:string):void;
		(key:'text', value:string):void;
	}
}

var Label:{
	new (kwArgs:HashMap<any>):Label;
	prototype:Label;
};

if (has('host-browser')) {
	Label = <typeof Label> require('./dom/Label');
}

export = Label;

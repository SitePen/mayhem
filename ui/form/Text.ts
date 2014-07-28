/// <amd-dependency path="../dom/form/Text" />

import has = require('../../has');
import Widget = require('../Widget');

interface Text extends Widget {
	get:Text.Getters;
	on:Text.Events;
	set:Text.Setters;
}

module Text {
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

var Text:{ new (kwArgs:HashMap<any>):Text; };

if (has('host-browser')) {
	Text = <typeof Text> require('../dom/form/Text');
}

export = Text;

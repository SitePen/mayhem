/// <amd-dependency path="../dom/form/Text" />

import has = require('../../has');
import KeyboardType = require('./KeyboardType');
import Widget = require('../Widget');

interface Text extends Widget {
	get:Text.Getters;
	on:Text.Events;
	set:Text.Setters;
}

module Text {
	export interface Events extends Widget.Events {}

	export interface Getters extends Widget.Getters {
		(key:'autoCommit'):boolean;
		(key:'isMultiLine'):boolean;
		(key:'isSecureEntry'):boolean;
		(key:'keyboardType'):KeyboardType;
		(key:'placeholder'):string;
		(key:'value'):string;
	}

	export interface Setters extends Widget.Setters {
		(key:'autoCommit', value:boolean):void;
		(key:'isMultiLine', value:boolean):void;
		(key:'isSecureEntry', value:boolean):void;
		(key:'keyboardType', value:KeyboardType):void;
		(key:'placeholder', value:string):void;
		(key:'value', value:string):void;
	}
}

var Text:{
	new (kwArgs:HashMap<any>):Text;
	prototype:Text;
};

if (has('host-browser')) {
	Text = <typeof Text> require('../dom/form/Text');
}

export = Text;

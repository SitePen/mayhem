/// <amd-dependency path="./dom/View" />

import has = require('../has');
import Widget = require('./Widget');

interface View extends Widget {
	get:View.Getters;
	on:View.Events;
	set:View.Setters;
}

module View {
	export interface Events extends Widget.Events {}

	export interface Getters extends Widget.Getters {
		(key:'model'):any;
	}

	export interface Setters extends Widget.Setters {
		(key:'model', value:any):void;
	}
}

var View:{ new (kwArgs:HashMap<any>):View; };

if (has('host-browser')) {
	View = <typeof View> require('./dom/View');
}

export = View;

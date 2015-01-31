/// <amd-dependency path="../dom/form/Error" />

import has = require('../../has');
import Widget = require('../Widget');
import DELETE_ME = require('../dom/form/Error');

interface ErrorWidget extends Widget {
	get:ErrorWidget.Getters;
	on:ErrorWidget.Events;
	set:ErrorWidget.Setters;
}

module ErrorWidget {
	export interface Events extends Widget.Events {}

	export interface Getters extends Widget.Getters {
		(key:'errors'):Error[];
		(key:'prefix'):string;
	}

	export interface Setters extends Widget.Setters {
		(key:'errors', value:Error[]):void;
		// Optional text that is displayed before the list of errors, like "Please correct the following errors:"
		(key:'prefix', value:string):void;
	}
}

var ErrorWidget:{
	new (kwArgs:HashMap<any>):ErrorWidget;
	prototype:ErrorWidget;
};

if (has('host-browser')) {
	ErrorWidget = <typeof ErrorWidget> require('../dom/form/Error');
}

export = ErrorWidget;

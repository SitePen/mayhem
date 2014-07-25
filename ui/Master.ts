import core = require('../interfaces');
import has = require('../has');
import View = require('./View');

interface Master extends View {
	get:Master.Getters;
	on:Master.Events;
	set:Master.Setters;
}

module Master {
	export interface Events extends View.Events {}

	export interface Getters extends View.Getters {
		(key:'model'):core.IApplication;
	}

	export interface Setters extends View.Setters {
		(key:'model', value:core.IApplication):void;
	}
}

var Master:{ new (kwArgs:HashMap<any>):Master; };

if (has('host-browser')) {
	Master = <typeof Master> require('./dom/Master');
}

export = Master;

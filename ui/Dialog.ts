/// <amd-dependency path="./dom/Dialog" />

import Container = require('./Container');
import has = require('../has');

interface Dialog extends Container {
	get:Dialog.Getters;
	on:Dialog.Events;
	set:Dialog.Setters;
}

module Dialog {
	export interface Events extends Container.Events {}
	export interface Getters extends Container.Getters {
		(key:'isOpen'):boolean;
		(key:'title'):string;
	}
	export interface Setters extends Container.Setters {
		(key:'isOpen', value:boolean):void;
		(key:'title', value:string):void;
	}
}

var Dialog:{
	new (kwArgs:HashMap<any>):Dialog;
	prototype:Dialog;
};

if (has('host-browser')) {
	Dialog = <typeof Dialog> require('./dom/Dialog');
}

export = Dialog;

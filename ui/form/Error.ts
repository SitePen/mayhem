/// <amd-dependency path="./dom/Error" />

import has = require('../../has');
import View = require('../View');

interface Error extends View {
	get:Error.Getters;
	on:Error.Events;
	set:Error.Setters;
}

module Error {
	export interface Events extends View.Events {}
	export interface Getters extends View.Getters {}
	export interface Setters extends View.Setters {}
}

var Error:{
	new (kwArgs:HashMap<any>):Error;
	prototype:Error;
};

if (has('host-browser')) {
	Error = <typeof Error> require('./dom/Error');
}

export = Error;

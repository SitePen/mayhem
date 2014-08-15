/// <amd-dependency path="./dom/Button" />

import core = require('../../interfaces');
import has = require('../../has');
import Label = require('../Label');

interface Button extends Label {
	get:Button.Getters;
	on:Button.Events;
	set:Button.Setters;
}

module Button {
	export interface Events extends Label.Events {
		(type:'activate', listener:core.IEventListener<core.IEvent>):IHandle;
	}
	export interface Getters extends Label.Getters {}
	export interface Setters extends Label.Setters {}
}

var Button:{
	new (kwArgs:HashMap<any>):Button;
	prototype:Button;
};

if (has('host-browser')) {
	Button = <typeof Button> require('./dom/Button');
}

export = Button;

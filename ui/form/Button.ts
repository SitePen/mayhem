/// <amd-dependency path="../dom/form/Button" />

import AbstractInput = require('./AbstractInput');
import core = require('../../interfaces');
import has = require('../../has');

interface Button extends AbstractInput {
	get:Button.Getters;
	on:Button.Events;
	set:Button.Setters;
}

module Button {
	export interface Events extends AbstractInput.Events {
		(type:'activate', listener:core.IEventListener<core.IEvent>):IHandle;
	}
	export interface Getters extends AbstractInput.Getters {
		(name:'formattedLabel'):string;
		(name:'icon'):string;
		(name:'label'):string;
	}
	export interface Setters extends AbstractInput.Setters {
		(name:'formattedLabel', value:string):void;
		(name:'icon', value:string):void;
		(name:'label', value:string):void;
	}
}

var Button:{
	new (kwArgs:HashMap<any>):Button;
	prototype:Button;
};

if (has('host-browser')) {
	Button = <typeof Button> require('../dom/form/Button');
}

export = Button;

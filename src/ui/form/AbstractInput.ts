import Widget = require('../Widget');

interface AbstractInput extends Widget {
	get:AbstractInput.Getters;
	on:AbstractInput.Events;
	set:AbstractInput.Setters;
}

module AbstractInput {
	export interface Events extends Widget.Events {}
	export interface Getters extends Widget.Getters {
		(key:'disabled'):boolean;
		(key:'readOnly'):boolean;
	}

	export interface Setters extends Widget.Setters {
		(key:'disabled', value:boolean):void;
		(key:'readOnly', value:boolean):void;
	}
}

export = AbstractInput;

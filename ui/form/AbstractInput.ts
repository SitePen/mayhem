import Widget = require('../Widget');

class AbstractInput extends Widget {
	get:AbstractInput.Getters;
	set:AbstractInput.Setters;
}

module AbstractInput {
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

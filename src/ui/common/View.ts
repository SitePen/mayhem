import Widget = require('./Widget');

class View extends Widget {
	get:View.Getters;
	set:View.Setters;
}

module View {
	export interface Getters extends Widget.Getters {
		(key:'model'):Object;
	}

	export interface Setters extends Widget.Setters {
		(key:'model', value:Object):void;
	}
}

export = View;

import Widget = require('../Widget');

class Text {
	get:Text.Getters;
	set:Text.Setters;

	render():void {

	}
}

module Text {
	export interface Getters {
		(key:'placeholder'):string;
		(key:'value'):string;
		(key:string):void;
	}

	export interface Setters {
		(key:'placeholder', value:string):void;
		(key:'value', value:string):void;
		(key:string, value:any):void;
	}
}

export = Text;

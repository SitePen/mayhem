/// <amd-dependency path="./dom/Container" />

import AddPosition = require('./AddPosition');
import has = require('../has');
import Widget = require('./Widget');

interface Container extends Widget {
	get:Container.Getters;
	on:Container.Events;
	set:Container.Setters;

	add(child:Widget, position?:AddPosition):IHandle;
	add(child:Widget, position?:number):IHandle;

	empty():void;

	getChildIndex(child:Widget):number;

	remove(position:number):void;
	remove(child:Widget):void;
}

module Container {
	export interface Events extends Widget.Events {}
	export interface Getters extends Widget.Getters {
		(key:'children'):Widget[];
	}
	export interface Setters extends Widget.Setters {
		(key:'children', value:Widget[]):void;
	}
}

var Container:{
	new (kwArgs:HashMap<any>):Container;
	prototype:Container;
};

if (has('host-browser')) {
	Container = <typeof Container> require('./dom/Container');
}

export = Container;

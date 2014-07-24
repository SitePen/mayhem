/// <amd-dependency path="./dom/Widget" />

import ClassList = require('./style/ClassList');
import core = require('../interfaces');
import has = require('../has');
import ObservableEvented = require('../ObservableEvented');

interface Widget extends ObservableEvented {
	get:Widget.Getters;
	on:Widget.Events;
	set:Widget.Setters;
}

module Widget {
	export interface Events extends ObservableEvented.Events {
		// TODO: Research iOS/Android for extra native events
		(type:'gotpointercapture', listener:core.IEventListener):IHandle;
		(type:'lostpointercapture', listener:core.IEventListener):IHandle;
		(type:'pointercancel', listener:core.IEventListener):IHandle;
		(type:'pointerdown', listener:core.IEventListener):IHandle;
		(type:'pointerenter', listener:core.IEventListener):IHandle;
		(type:'pointerleave', listener:core.IEventListener):IHandle;
		(type:'pointermove', listener:core.IEventListener):IHandle;
		(type:'pointerout', listener:core.IEventListener):IHandle;
		(type:'pointerover', listener:core.IEventListener):IHandle;
		(type:'pointerstart', listener:core.IEventListener):IHandle;
		(type:'pointerup', listener:core.IEventListener):IHandle;
	}

	export interface Getters extends ObservableEvented.Getters {
		(key:'app'):core.IApplication;
		(key:'attached'):boolean;
		(key:'class'):string;
		(key:'classList'):ClassList;
		(key:'id'):string;
		(key:'index'):number;
		(key:'parent'):Widget;
	}

	export interface Setters extends ObservableEvented.Setters {
		(key:'app', value:core.IApplication):void;
		(key:'attached', value:boolean):void;
		(key:'class', value:string):void;
		(key:'id', value:string):void;
		(key:'parent', value:Widget):void;
	}
}

var Widget:{ new (kwArgs:HashMap<any>):Widget; };

if (has('host-browser')) {
	Widget = <typeof Widget> require('./dom/Widget');
}

export = Widget;

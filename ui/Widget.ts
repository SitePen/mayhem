/// <amd-dependency path="./dom/Widget" />

import ClassList = require('./style/ClassList');
import Container = require('./Container');
import core = require('../interfaces');
import has = require('../has');
import ObservableEvented = require('../ObservableEvented');

interface Widget extends ObservableEvented {
	detach():any;
	get:Widget.Getters;
	on:Widget.Events;
	set:Widget.Setters;
}

module Widget {
	export interface Events extends ObservableEvented.Events {
		// TODO: Research iOS/Android for extra native events
		// TODO: Fix core.IEvent to be the right event types for pointers
		(type:'gotpointercapture', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'lostpointercapture', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointercancel', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerdown', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerenter', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerleave', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointermove', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerout', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerover', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerstart', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerup', listener:core.IEventListener<core.IEvent>):IHandle;
	}

	export interface Getters extends ObservableEvented.Getters {
		(key:'app'):core.IApplication;
		(key:'attached'):boolean;
		(key:'class'):string;
		(key:'classList'):ClassList;
		(key:'id'):string;
		(key:'index'):number;
		(key:'parent'):Container;
	}

	export interface Setters extends ObservableEvented.Setters {
		(key:'app', value:core.IApplication):void;
		(key:'attached', value:boolean):void;
		(key:'class', value:string):void;
		(key:'id', value:string):void;
		(key:'parent', value:Container):void;
	}
}

var Widget:{ new (kwArgs:HashMap<any>):Widget; };

if (has('host-browser')) {
	Widget = <typeof Widget> require('./dom/Widget');
}

export = Widget;

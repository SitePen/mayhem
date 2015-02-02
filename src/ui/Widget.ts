/// <amd-dependency path="./dom/Widget" />

import ClassList = require('./style/ClassList');
import core = require('../interfaces');
import has = require('../has');
import ObservableEvented = require('../ObservableEvented');
import WebApplication = require('../WebApplication');

interface Widget extends ObservableEvented {
	get:Widget.Getters;
	on:Widget.Events;
	set:Widget.Setters;

	detach():any;
}

module Widget {
	export interface Events extends ObservableEvented.Events {
		// TODO: Research iOS/Android for extra native events
		// TODO: Fix core.IEvent to be the right event types for pointers
		(type:'pointercancel', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerdown', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerenter', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerleave', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointermove', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerout', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerover', listener:core.IEventListener<core.IEvent>):IHandle;
		(type:'pointerup', listener:core.IEventListener<core.IEvent>):IHandle;
	}

	export interface Getters extends ObservableEvented.Getters {
		(key:'app'):WebApplication;
		(key:'class'):string;
		(key:'classList'):ClassList;
		(key:'id'):string;
		(key:'index'):number;
		(key:'isAttached'):boolean;
		(key:'parent'):Widget;
	}

	export interface Setters extends ObservableEvented.Setters {
		(key:'app', value:WebApplication):void;
		(key:'class', value:string):void;
		(key:'id', value:string):void;
		(key:'isAttached', value:boolean):void;
		(key:'parent', value:Widget):void;
	}
}

/**
 * The Widget class is the base class for all user interface components within the Mayhem view system.
 *
 * @constructor module:mayhem/ui/Widget
 */
var Widget:{
	new (kwArgs:HashMap<any>):Widget;
	prototype:Widget;
};

if (has('host-browser')) {
	Widget = <typeof Widget> require('./dom/Widget');
}

export = Widget;

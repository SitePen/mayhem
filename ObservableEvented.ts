/// <reference path="./dojo" />

import aspect = require('dojo/aspect');
import core = require('./interfaces');
import lang = require('dojo/_base/lang');
import Evented = require('dojo/Evented');
import Observable = require('./Observable');
import on = require('dojo/on');
import SyntheticEvent = require('./SyntheticEvent');
import util = require('./util');

class ObservableEvent extends SyntheticEvent {
	initEvent(type:string, bubbles:boolean, cancelable:boolean):void {
		this.type = type;
		this.bubbles = bubbles;
		this.cancelable = cancelable;
	}

	stopPropagation():void {
		if (this.bubbles) {
			this.propagationStopped = true;
		}
	}

	preventDefault():void {
		if (this.cancelable) {
			this.defaultPrevented = true;
		}
	}
}

// TODO: Define an Event interface for Mayhem and use it as the type for events in this class
class ObservableEvented extends Observable implements core.IObservableEvented {
	constructor(kwArgs?:Object) {
		super(kwArgs);
		Evented.apply(this, arguments);
	}

	/* protected */ _getEventedMethodName(type:string):string {
		return 'on' + type;
	}

	emit(event:SyntheticEvent):boolean {
		var type = event.type,
			oldCurrentTarget = event.currentTarget;

		event.currentTarget = this;

		var method = this._getEventedMethodName(type);
		if (this[method]) {
			this[method](event);
		}

		if (event.bubbles && !event.propagationStopped) {
			var parent = this.get('parent');
			if (parent && parent.emit) {
				parent.emit(event);
			}
		}

		method = this['_' + method];
		if (!event.defaultPrevented && method) {
			if (typeof method === 'function') {
				var func:Function = <any>method;
				func.call(this, event);
			}
			else if (typeof method === 'string') {
				var newEvent = new ObservableEvent({
					bubbles: true,
					cancelable: true,
					type: method,
					target: this,
					sourceEvent: event
				});
				this.emit(newEvent);
			}
		}

		event.currentTarget = null;

		return !event.defaultPrevented;
	}

	on(type:IExtensionEvent, listener:(event:any) => void):IHandle;
	on(type:string, listener:(event:any) => void):IHandle;
	on(type:any, listener:(event:any) => void):IHandle {
		return on.parse(this, type, listener, (target:any, type:string):IHandle => {
			return aspect.after(target, this._getEventedMethodName(type), listener, true);
		});
	}
}

export = ObservableEvented;

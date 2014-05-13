/// <reference path="./dojo" />

import aspect = require('dojo/aspect');
import core = require('./interfaces');
import lang = require('dojo/_base/lang');
import Evented = require('dojo/Evented');
import Observable = require('./Observable');
import on = require('dojo/on');
import Event = require('./Event');
import util = require('./util');

// TODO: Define an Event interface for Mayhem and use it as the type for events in this class
class ObservableEvented extends Observable implements core.IObservableEvented {
	constructor(kwArgs?:Object) {
		super(kwArgs);
		Evented.apply(this, arguments);
	}

	/* protected */ _getEventedMethodName(type:string):string {
		return 'on' + type;
	}

	emit(event:Event):boolean {
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

		// TODO: The default mechanism actually runs in reverse order (parent first,
		// then child) which seems kind of backwards since bubbling happens the other
		// way
		method = this['default' + method.slice(2)];
		if (!event.defaultPrevented && method) {
			if (typeof method === 'function') {
				var func:Function = <any>method;
				func.call(this, event);
			}
			/*else if (typeof method === 'string') {
				var newEvent = new Event({
					bubbles: true,
					cancelable: true,
					type: method,
					target: this,
					sourceEvent: event
				});
				this.emit(newEvent);
			}*/
		}

		event.currentTarget = null;

		return !event.defaultPrevented;
	}

	on(type:any, listener:(event:core.IEvent) => void):IHandle {
		return on.parse(this, type, <any>listener, (target:any, type:string):IHandle => {
			return aspect.after(target, this._getEventedMethodName(type), listener, true);
		});
	}
}

export = ObservableEvented;

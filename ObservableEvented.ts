/// <reference path="./dojo" />

import core = require('./interfaces');
import Evented = require('dojo/Evented');
import Observable = require('./Observable');

// TODO: Define an Event interface for Mayhem and use it as the type for events in this class
class ObservableEvented extends Observable implements core.IObservableEvented {
	constructor(kwArgs?:Object) {
		super(kwArgs);
		Evented.apply(this, arguments);
	}

	emit(type:any, event?:any):boolean {
		return Evented.prototype.emit.apply(this, arguments);
	}

	on(type:IExtensionEvent, listener:(event:any) => void):IHandle;
	on(type:string, listener:(event:any) => void):IHandle;
	on(type:any, listener:(event:any) => void):IHandle {
		return Evented.prototype.on.apply(this, arguments);
	}
}

export = ObservableEvented;

/// <reference path="./dojo" />

import core = require('./interfaces');
import Evented = require('dojo/Evented');
import Observable = require('./Observable');

class ObservableEvented extends Observable implements Evented {
	constructor(kwArgs?:Object) {
		super(kwArgs);
		Evented.apply(this, arguments);
	}

	emit(type:any, event?:Event):void {
		Evented.prototype.emit.apply(this, arguments);
	}

	on(type:IExtensionEvent, listener:(event:Event) => void):IHandle;
	on(type:string, listener:(event:Event) => void):IHandle;
	on(type:any, listener:(event:Event) => void):IHandle {
		return Evented.prototype.on.apply(this, arguments);
	}
}

export = ObservableEvented;

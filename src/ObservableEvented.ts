import core = require('./interfaces');
import Evented = require('dojo/Evented');
import Observable = require('./Observable');

/**
 * The ObservableEvented class is a base object class that combines an Observable object with an event emitter. This
 * class should be used as a base class for objects that also need to emit events.
 */
class ObservableEvented extends Observable {
	protected _eventListeners:IHandle[];

	constructor(kwArgs?:{}) {
		this._eventListeners = [];
		super(kwArgs);
		Evented.apply(this, arguments);
	}

	destroy() {
		super.destroy();

		var handle:IHandle;
		while ((handle = this._eventListeners.pop())) {
			handle.remove();
		}
	}

	emit(event:core.IEvent):boolean {
		return Evented.prototype.emit.call(this, event.type, event);
	}

	get:ObservableEvented.Getters;
	on:ObservableEvented.Events;
	set:ObservableEvented.Setters;
}

ObservableEvented.prototype.on = function (type:any, listener:core.IEventListener<core.IEvent>):IHandle {
	var handle = Evented.prototype.on.call(this, type, listener);
	this._eventListeners.push(handle);
	return handle;
};

module ObservableEvented {
	export interface Events {
		(type:IExtensionEvent, listener:core.IEventListener<core.IEvent>):IHandle;
		(type:string, listener:core.IEventListener<core.IEvent>):IHandle;
	}
	export interface Getters extends Observable.Getters {}
	export interface Setters extends Observable.Setters {}
}

export = ObservableEvented;

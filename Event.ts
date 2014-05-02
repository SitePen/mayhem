import core = require('./interfaces');
import has = require('./has');

/**
 * This is a base class for synthetic (non-DOM) events.
 */
class Event implements core.IEvent {
	bubbles:boolean;
	cancelable:boolean;
	currentTarget:any;
	defaultPrevented:boolean;
	propagationStopped:boolean;
	target:any;
	timeStamp:number = new Date().getTime();
	type:string;

	constructor(kwArgs?:any) {
		if (kwArgs) {
			for (var k in kwArgs) {
				if (k === 'constructor') {
					continue;
				}
				this[k] = kwArgs[k];
			}
		}
	}

	preventDefault():void {
		if (this.cancelable) {
			this.defaultPrevented = true;
		}
	}

	stopImmediatePropagation():void {
		// TODO: implement this
		if (has('debug')) {
			throw new Error('Abstract method "stopImmediatePropagation" not implemented');
		}
	}

	stopPropagation():void {
		if (this.bubbles) {
			this.propagationStopped = true;
		}
	}
}

export = Event;

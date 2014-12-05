import core = require('./interfaces');

/**
 * The Event class is the base class for all Mayhem events. It provides an interface that is similar to the W3C event
 * API, but includes corrections and extensions in order to function better.
 */
class Event implements core.IEvent {
	bubbles:boolean;
	cancelable:boolean;
	currentTarget:any;
	defaultPrevented:boolean;
	immediatePropagationStopped:boolean;
	propagationStopped:boolean;
	target:any;
	timestamp:number = +new Date();
	type:string;

	constructor(kwArgs?:any) {
		if (kwArgs) {
			for (var k in kwArgs) {
				if (k === 'constructor') {
					continue;
				}
				// TS7017
				(<any> this)[k] = kwArgs[k];
			}
		}
	}

	preventDefault():void {
		if (this.cancelable) {
			this.defaultPrevented = true;
		}
	}

	stopImmediatePropagation():void {
		if (this.bubbles) {
			this.immediatePropagationStopped = true;
		}
	}

	stopPropagation():void {
		if (this.bubbles) {
			this.propagationStopped = true;
		}
	}
}

export = Event;

import core = require('./interfaces');
import has = require('./has');

/**
 * This is a base class for synthetic (non-DOM) events.
 */
class SyntheticEvent implements core.ISyntheticEvent {
    timeStamp:number = new Date().getTime();
    defaultPrevented:boolean;
	propagationStopped:boolean;
    isTrusted:boolean;
    currentTarget:any;
    cancelBubble:boolean;
    target:any;
    eventPhase:number;
    cancelable:boolean;
    type:string;
    srcElement:Element;
    bubbles:boolean;
    CAPTURING_PHASE:number;
    AT_TARGET:number;
    BUBBLING_PHASE:number;

	constructor(kwArgs?:Object) {
		if (kwArgs) {
			for (var k in kwArgs) {
				this[k] = kwArgs[k];
			}
		}
	}

	initEvent(type:string, bubbles:boolean, cancelable:boolean):void {
		this.type = type;
		this.bubbles = bubbles;
		this.cancelable = cancelable;
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

export = SyntheticEvent;

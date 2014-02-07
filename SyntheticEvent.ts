import has = require('./has');

/**
 * This is a base class for synthetic (non-DOM) events.
 */
class SyntheticEvent implements Event {
    timeStamp:number = new Date().getTime();
    defaultPrevented:boolean;
    isTrusted:boolean;
    currentTarget:EventTarget;
    cancelBubble:boolean;
    target:EventTarget;
    eventPhase:number;
    cancelable:boolean;
    type:string;
    srcElement:Element;
    bubbles:boolean;
    CAPTURING_PHASE:number;
    AT_TARGET:number;
    BUBBLING_PHASE:number;

    initEvent(eventTypeArg:string, canBubbleArg:boolean, cancelableArg:boolean):void {
		if (has('debug')) {
			throw new Error('Abstract method "initEvent" not implemented');
		}
	}

    stopPropagation():void {
		if (has('debug')) {
			throw new Error('Abstract method "stopPropagation" not implemented');
		}
	}

    stopImmediatePropagation():void {
		if (has('debug')) {
			throw new Error('Abstract method "stopImmediatePropagation" not implemented');
		}
	}

    preventDefault():void {
		if (has('debug')) {
			throw new Error('Abstract method "preventDefault" not implemented');
		}
	}
}

export = SyntheticEvent;

/// <reference path="../../dojo" />

import aria = require('./util/aria');
import array = require('dojo/_base/array');
import core = require('../../interfaces');
import dom = require('./interfaces');
import MayhemEvent = require('../../Event');
import keys = require('dojo/keys');
import has = require('../../has');
import lang = require('dojo/_base/lang');
import mouse = require('dojo/mouse');
import on = require('dojo/on');
import touch = require('dojo/touch');
import util = require('../../util');
import win = require('dojo/_base/window');

class ActionEvent extends MayhemEvent {
	bubbles:boolean = true;
	cancelable:boolean = true;
	sourceEvent:core.IEvent;

	// TODO: implement propagation events (if it makes sense to bubble action to widget parent)
}

var body:HTMLBodyElement = win.body();

export var customEvents:{ [key:string]: IExtensionEvent; } = {
	'touch-press': touch.press,
	'touch-release': touch.release,
	'touch-over': touch.over,
	'touch-out': touch.out,
	'touch-enter': touch.enter,
	'touch-leave': touch.leave,
	'touch-move': touch.move,
	'touch-cancel': touch.cancel,

	'mouse-enter': mouse.enter,
	'mouse-leave': mouse.leave,
	'mouse-wheel': mouse.wheel,

	// TODO: something like this...
	// 'gesture-tap': gesture.tap,
	// 'gesture-hold': gesture.tap.hold,
	// 'gesture-doubletap': gesture.tap.doubletap,
	// 'gesture-swipe': gesture.swipe,
	// 'gesture-swipeend': gesture.swipe.end,
	// ...
};

function filter(eventType:any, config:any = {}):Function {
	var target:any = config.target,
		keyCode:any = config.keyCode;

	if (customEvents[eventType]) {
		eventType = customEvents[eventType];
	}

	// Keycode can be an int, character or an enum mapping to a constant in dojo/keys
	if (typeof keyCode === 'string') {
		keyCode = keyCode.length === 1 ? keyCode.toUpperCase().charCodeAt() : keys[keyCode.toUpperCase()];
		if (has('debug') && !keyCode) {
			throw new Error('Unknown key specified in listener config: ' + config.keyCode);
		}
	}

	return function(node:Node, handler:Function):IHandle {
		return on(target || node, eventType, function(event:Event):IHandle {
			// Test keyCode, if specified
			// TODO: support other modifier filters
			if (keyCode && keyCode !== event['keyCode']) {
				return;
			}

			if (config.excludeNode && (<any> node).contains(event.target)) {
				return;
			}

			handler.apply(node, arguments);
		});
	};
}

// Allow property changes to or from specific values to emit action events
function changeTrigger(widget:dom.IElementWidget, actionName:string, config:any = {}):IPausableHandle {
	var paused:boolean,
		handle = widget.observe(config.name, (value:any, previous:any):void => {
			if (paused || ('to' in config && value !== config.to) || ('from' in config && previous !== config.from)) {
				return;
			}

			// Always prevent default behavior on change-triggered events (since the behavior already occurred)
			var event = new ActionEvent({ type: actionName, target: widget });
			event.preventDefault();
			widget.trigger(actionName, event);
		});

	return {
		pause: ():void => {
			paused = true;
		},
		remove: function():void {
			this.remove = function():void {};
			handle.remove();
			handle = widget = config = event = null;
		},
		resume: ():void => {
			paused = false;
		}
	};
}

export class Action implements dom.IAction {
	name:string;
	_pausedIds:any = {};
	role:string;
	triggers:any[];

	attach(widget:dom.IElementWidget):IPausableHandle {
		var name = this.name;
		!name && has('debug') && console.debug('Action config must have a name property');
		var id = widget.get('id'),
			_pausedIds = this._pausedIds,
			triggerHandles = array.map(this.triggers, (triggerConfig:any):IPausableHandle => {
				if (typeof triggerConfig === 'string') {
					triggerConfig = filter(triggerConfig);
				}
				else if (triggerConfig.type) {
					if (triggerConfig.type === 'change') {
						return changeTrigger(widget, triggerConfig);
					}
					triggerConfig = filter(triggerConfig.type, triggerConfig);
				}
				return on.pausable(widget._outerFragment, triggerConfig, (event:Event):void => {
					widget.trigger(name, <any>event);
				});
			});

		return {
			pause: ():void => {
				_pausedIds[id] = true;
				array.forEach(triggerHandles, (handle:IPausableHandle):void => handle.pause());
			},
			remove: function():void {
				this.remove = function():void {};
				delete _pausedIds[id];
				util.remove.apply(null, triggerHandles);
				widget = triggerHandles = id = null;
			},
			resume: ():void => {
				_pausedIds[id] = false;
				array.forEach(triggerHandles, (handle:IPausableHandle):void => handle.resume());
			}
		};
	}

	perform(widget:dom.IElementWidget):void {}

	trigger(widget:dom.IElementWidget, source?:core.IEvent):void {
		var id = widget.get('id');
		if (this._pausedIds[id]) {
			return;
		}

		// Pause action triggers while processing action
		this._pausedIds[id] = true;

		var event = new ActionEvent({
			type: this.name,
			target: widget
		});
		if (source) {
			event.sourceEvent = source;
		}
		if (widget.emit(event)) {
			this.perform(widget);
		}

		this._pausedIds[id] = false;
		var afterEvent = new ActionEvent({
			type: 'after-' + this.name,
			target: widget
		});
		widget.emit(afterEvent);
	}
}

// TODO: stuff
export class Focus extends Action {}
Focus.prototype.name = 'focus';

export class Blur extends Action {}
Blur.prototype.name = 'blur';

export class Press extends Action {
	attach(widget:dom.IElementWidget):IPausableHandle {
		var handle = super.attach(widget),
			stateName = aria.getStateName(this.role, 'selected'),
			observerHandle = widget.observe('selected', (value:boolean):void => {
				// aria.setState(widget._outerFragment, stateName, value);
				// TODO: this belongs on the widget
				widget.classList.toggle('selected', value);
			});

		var _remove = handle.remove;
		handle.remove = function ():void {
			this.remove = function():void {};
			observerHandle.remove();
			_remove.call(handle);
			widget._outerFragment.removeAttribute(stateName);
			widget = observerHandle = handle = _remove = null;
		};

		return handle;
	}
}

Press.prototype.name = 'press';
Press.prototype.triggers = [ { type: touch.press } ];

export class CheckboxPress extends Press {
	perform(widget:dom.IElementWidget):void {
		widget.set('selected', !widget.get('selected'));
	}
}

CheckboxPress.prototype.role = 'checkbox';
CheckboxPress.prototype.triggers = [ 'touch-press', filter('keyup', { keyCode: 'enter' }) ];

export class RadioPress extends Press {
	perform(widget:dom.IElementWidget):void {
		widget.set('selected', true);
	}

	trigger(widget:dom.IElementWidget, event?:core.IEvent):void {
		if (!widget.get('selected')) {
			super.trigger(widget, event);
		}
	}
}

RadioPress.prototype.role = 'radio';
RadioPress.prototype.triggers = [ 'touch-press', filter('keyup', { keyCode: 'enter' }) ];

export class LinkPress extends Press {
	perform(widget:dom.IElementWidget):void {
		var href = widget.get('href');

		// TODO: if copyKey, or middle mouse btn, new tab
		// if (mouse.isMiddle(event) || copyKey) 

		if (typeof href === 'string') {
			window.location.href = href;
		}
		else if (href && typeof href.history === 'number') {
			// TODO: think this through
			window.history.go(href.history);
		}
	}
}

LinkPress.prototype.role = 'link';
LinkPress.prototype.triggers = [ 'touch-press', filter('keypress', { keyCode: 'enter' }), filter('keyup', { keyCode: 'space' }) ];

export class ButtonPress extends Press {
	perform(widget:dom.IElementWidget):void {
		// Widget behaves like a toggle button if it has "selected" state defined
		var selected = widget.get('selected');
		if (selected !== undefined) {
			widget.set('selected', !selected);
		}
	}
}

ButtonPress.prototype.role = 'button';
ButtonPress.prototype.triggers = [ 'touch-press', filter('keypress', { keyCode: 'enter' }), filter('keyup', { keyCode: 'space' }) ];

export class DialogDismiss extends Action {
	perform(widget:dom.IElementWidget):void {
		widget.set('hidden', true);
	}

	trigger(widget:dom.IElementWidget, event:core.IEvent):void {
		if (!widget.get('hidden')) {
			super.trigger(widget, event);
		}
	}
}

DialogDismiss.prototype.name = 'dismiss';
DialogDismiss.prototype.role = 'dialog';
DialogDismiss.prototype.triggers = [
	{ type: 'change', name: 'hidden', to: true },
	filter('keydown', { keyCode: 'escape', target: body }),
	filter('mousedown', { target: body, excludeNode: true })
];

export class DialogShow extends Action {
	perform(widget:dom.IElementWidget):void {
		// TODO: set focus
		widget.set('hidden', false);
	}

	trigger(widget:dom.IElementWidget, event:core.IEvent):void {
		if (widget.get('hidden')) {
			super.trigger(widget, event);
		}
	}
}

DialogShow.prototype.name = 'show';
DialogShow.prototype.role = 'dialog';
DialogShow.prototype.triggers = [ { type: 'change', name: 'hidden', to: false } ];

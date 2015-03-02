import aspect = require('dojo/aspect');
import Event = require('../../Event');
import Master = require('./Master');
import ui = require('../interfaces');
import util = require('../../util');
import WeakMap = require('../../WeakMap');
import Widget = require('./Widget');

export interface ExtensionEvent {
	(target:Widget, callback:(event?:ui.UiEvent) => void):IHandle;
	symbol:string;
}

interface Registration {
	handle:IHandle;
	numActivations:number;
	unregisterTimer?:IHandle;
}

function createExtensionEvent(symbol:string, register:Function):ExtensionEvent {
	var registeredUis = new WeakMap<Master, Registration>();

	var extensionEvent = <ExtensionEvent> function (target:Widget, callback:(event?:ui.ClickEvent) => void):IHandle {
		var ui = <Master> target.get('app').get('ui');

		var registration = registeredUis.get(ui);
		if (!registration) {
			registration = {
				handle: register(ui),
				numActivations: 0
			};
			registeredUis.set(ui, registration);
		}
		else if (registration.unregisterTimer) {
			registration.unregisterTimer.remove();
			registration.unregisterTimer = null;
		}

		++registration.numActivations;
		var handle = target.on(symbol, callback);

		return util.createHandle(function () {
			if (--registration.numActivations === 0) {
				registration.unregisterTimer = util.createTimer(function () {
					registration.handle.remove();
					registeredUis.delete(ui);
					registration = null;
				});
			}

			handle.remove();
			handle = null;
		});
	};

	extensionEvent.symbol = symbol;
	return extensionEvent;
}

export var activate:ExtensionEvent = (function () {
	// TODO: Need to make these actions not need to have a separately prefixed name
	var ACTIVATE_SYMBOL = 'mayhemActivate';

	function convertEvent(originalEvent:ui.UiEvent):ui.UiEvent {
		var kwArgs:any = {
			bubbles: true,
			cancelable: true,
			target: originalEvent.target,
			type: ACTIVATE_SYMBOL,
			view: originalEvent.view
		};

		if ('clientX' in originalEvent) {
			kwArgs.clientX = (<ui.PointerEvent> originalEvent).clientX;
			kwArgs.clientY = (<ui.PointerEvent> originalEvent).clientY;
		}

		return <ui.UiEvent> new Event(kwArgs);
	}

	function register(ui:Master):IHandle {
		return util.createCompositeHandle(
			click(ui, function (event:ui.ClickEvent):void {
				if (event.numClicks === 1 && event.buttons === /* Left */ 1) {
					var newEvent = convertEvent(event);
					try {
						event.target.emit(newEvent);
					}
					finally {
						if (newEvent.defaultPrevented) {
							event.preventDefault();
						}
					}
				}
			}),
			ui.on('keyup', function (event:ui.KeyboardEvent):void {
				if (event.key === 'Enter' || event.key === ' ') {
					var newEvent = convertEvent(event);
					try {
						event.target.emit(newEvent);
					}
					finally {
						if (newEvent.defaultPrevented) {
							event.preventDefault();
						}
					}
				}
			})
		);
	}

	return createExtensionEvent(ACTIVATE_SYMBOL, register);
})();

interface ButtonState {
	defaultPrevented:boolean;
	numClicks:number;
	lastTarget:Widget;
	lastTimestamp:number;
	lastX:number;
	lastY:number;
	resetAfterDelay():void;
}

export var click:ExtensionEvent = (function () {
	// TODO: Need to make these actions not need to have a separately prefixed name
	var CLICK_SYMBOL = 'mayhemClick';
	var CLICK_SPEED = 300;
	var MAX_DISTANCE:HashMap<number> = {
		pen: 15,
		mouse: 5,
		touch: 40
	};

	function register(ui:Master):IHandle {
		var buttons:{ [buttonId:number]: ButtonState; } = {};

		function resetButton(buttonId:number):void {
			buttons[buttonId] = null;
		}

		return util.createCompositeHandle(
			ui.on('pointerdown', function (event:ui.PointerEvent):void {
				if (!event.isPrimary) {
					return;
				}

				var buttonState:ButtonState = buttons[event.button];

				if (!buttonState) {
					buttonState = buttons[event.button] = <ButtonState> {
						resetAfterDelay: util.debounce(function () {
							resetButton(event.button);
						}, CLICK_SPEED)
					};
				}

				var target = <Widget> event.target;

				// If a click occurred and then the DOM mutated to cause a different target to be rendered at the same
				// coordinates in the window, we should treat it as a start from zero clicks
				if (buttonState.lastTarget !== target) {
					buttonState.numClicks = 0;
					buttonState.lastTarget = target;
				}

				buttonState.lastTimestamp = event.timestamp;

				// Only store the coordinates of the first tap down to avoid clicks crawing across the page
				if (buttonState.numClicks === 0) {
					buttonState.lastX = event.clientX;
					buttonState.lastY = event.clientY;
				}

				buttonState.resetAfterDelay();
			}),
			ui.on('pointerup', function (event:ui.PointerEvent):void {
				if (!event.isPrimary) {
					return;
				}

				// TODO: Need to know when the event cycle has finished to know whether we should do a default action
				// event.registerDefaultAction(...the stuff below); ?

				var buttonState:ButtonState = buttons[event.button];

				if (!buttonState) {
					return;
				}

				if (
					// The timestamp is checked just in case the browser event loop somehow gets us to receive the event
					// before the debounced reset function fires but after the click event heuristic has expired
					event.timestamp - buttonState.lastTimestamp < CLICK_SPEED &&
					Math.abs(event.clientX - buttonState.lastX) < MAX_DISTANCE[event.pointerType] &&
					Math.abs(event.clientY - buttonState.lastY) < MAX_DISTANCE[event.pointerType]
				) {
					++buttonState.numClicks;
					var newEvent:ui.ClickEvent = <any> new Event(event);
					newEvent.type = CLICK_SYMBOL;
					newEvent.numClicks = buttonState.numClicks;
					// The received event is a pointerup event, which means that the value of buttons is representative
					// of the button state *after* the button was released; add back the original button for click event
					// recipients to match the buttons that were pressed *at the time of the click*, including the
					// clicked button
					newEvent.buttons = event.buttons | event.button;

					try {
						event.target.emit(newEvent);
					}
					finally {
						if (newEvent.defaultPrevented) {
							event.preventDefault();
						}

						// Restarts the countdown to button reset for double/triple/etc. clicks
						buttonState.resetAfterDelay();
					}
				}

				buttonState.lastTimestamp = null;
			})
		);
	}

	return createExtensionEvent(CLICK_SYMBOL, register);
})();

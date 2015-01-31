import aspect = require('dojo/aspect');
import Event = require('../../Event');
import ui = require('../interfaces');
import util = require('../../util');
import Widget = require('./Widget');

export function activate(target:Widget, callback:(event?:ui.UiEvent) => void):IHandle {
	return util.createCompositeHandle(
		click(target, function (event:ui.ClickEvent):void {
			if (event.numClicks === 1 && event.buttons === /* Left */ 1) {
				callback.call(this, event);
			}
		}),
		target.on('keyup', function (event:ui.KeyboardEvent):void {
			if (event.key === 'Enter' || event.key === ' ') {
				callback.call(this, event);
			}
		})
	);
}

interface ButtonState {
	defaultPrevented:boolean;
	numClicks:number;
	lastTarget:Widget;
	lastTimestamp:number;
	lastX:number;
	lastY:number;
	resetAfterDelay():void;
}

export var click:(target:Widget, callback:Function) => IHandle = (function () {
	var CLICK_SPEED = 300;
	var MAX_DISTANCE:HashMap<number> = {
		pen: 15,
		mouse: 5,
		touch: 40
	};

	var buttons:{ [buttonId:number]: ButtonState; } = {};

	function resetButton(buttonId:number):void {
		buttons[buttonId] = null;
	}

	return function (target:Widget, callback:(event?:ui.ClickEvent) => void):IHandle {
		return util.createCompositeHandle(
			target.on('pointerdown', function (event:ui.PointerEvent):void {
				if (!event.isPrimary || event.defaultPrevented) {
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

				aspect.after(event, 'preventDefault', function () {
					buttonState.defaultPrevented = true;
				});

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
			target.on('pointerup', function (event:ui.PointerEvent):void {
				if (!event.isPrimary || event.defaultPrevented) {
					return;
				}

				// TODO: Need to know when the event cycle has finished to know whether we should do a default action
				// event.registerDefaultAction(...the stuff below); ?

				var buttonState:ButtonState = buttons[event.button];

				if (!buttonState) {
					return;
				}

				if (buttonState.defaultPrevented) {
					buttonState.defaultPrevented = false;
					return;
				}

				if (
					// The timestamp is checked just in case the browser event loop somehow gets us to receive the event
					// before the debounced reset function fires but after the click event heuristic has expired
					event.timestamp - buttonState.lastTimestamp < CLICK_SPEED &&
					event.clientX - buttonState.lastX < MAX_DISTANCE[event.pointerType] &&
					event.clientY - buttonState.lastY < MAX_DISTANCE[event.pointerType]
				) {
					++buttonState.numClicks;
					var newEvent:ui.ClickEvent = <any> new Event(event);
					newEvent.type = 'click';
					newEvent.numClicks = buttonState.numClicks;
					// The received event is a pointerup event, which means that the value of buttons is representative
					// of the button state *after* the button was released; add back the original button for click event
					// recipients to match the buttons that were pressed *at the time of the click*, including the
					// clicked button
					newEvent.buttons = event.buttons | event.button;

					try {
						callback.call(this, newEvent);
					}
					finally {
						// Restarts the countdown to button reset for double/triple/etc. clicks
						buttonState.resetAfterDelay();
					}
				}

				buttonState.lastTimestamp = null;
			})
		);
	};
})();

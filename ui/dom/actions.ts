import Event = require('../../Event');
import ui = require('../interfaces');
import util = require('../../util');
import Widget = require('./Widget');

export function activate(target:Widget, callback:(event?:ui.UiEvent) => void):IHandle {
	return util.createCompositeHandle(
		click(target, function (event:ui.ClickEvent):void {
			if (event.numClicks === 1) {
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

export var click:(target:Widget, callback:Function) => IHandle = (function () {
	var CLICK_SPEED = 300;
	var MAX_DISTANCE:HashMap<number> = {
		pen: 15,
		mouse: 5,
		touch: 40
	};

	var lastTarget:Widget;
	var lastTimestamp:number;
	var lastX:number;
	var lastY:number;
	var numClicks:number = 0;

	var resetNumClicks:() => void = util.debounce(function ():void {
		lastTarget = lastX = lastY = null;
		numClicks = 0;
	}, CLICK_SPEED);

	return function (target:Widget, callback:(event?:ui.ClickEvent) => void):IHandle {
		return util.createCompositeHandle(
			target.on('pointerdown', function (event:ui.PointerEvent):void {
				if (!event.isPrimary) {
					return;
				}

				// If a click occurred and then the DOM mutated to cause a different target to be rendered at the same
				// coordinates in the window, we should treat it as a start from zero clicks
				if (lastTarget !== target) {
					numClicks = 0;
				}

				lastTarget = target;
				lastTimestamp = event.timestamp;
				// only store the coordinates of the first tap down to avoid clicks crawing across the page
				if (numClicks === 0) {
					lastX = event.clientX;
					lastY = event.clientY;
				}
			}),
			target.on('pointerup', function (event:ui.PointerEvent):void {
				if (!event.isPrimary) {
					return;
				}

				if (
					event.timestamp - lastTimestamp < CLICK_SPEED &&
					event.clientX - lastX < MAX_DISTANCE[event.pointerType] &&
					event.clientY - lastY < MAX_DISTANCE[event.pointerType]
				) {
					++numClicks;
					var newEvent:ui.ClickEvent = <any> new Event(event);
					newEvent.numClicks = numClicks;
					callback.call(this, newEvent);
					resetNumClicks();
				}

				lastTimestamp = null;
			})
		);
	};
})();

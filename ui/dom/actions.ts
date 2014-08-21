import Event = require('../../Event');
import ui = require('../interfaces');
import util = require('../../util');
import Widget = require('./Widget');

export function activate(target:Widget, callback:(event?:ui.UiEvent) => void):IHandle {
	return util.createCompositeHandle(
		click(target, function (event:ui.ClickEvent):void {
			if (event.numClicks === 1) {
				callback(event);
			}
		}),
		target.on('keyup', function (event:ui.KeyboardEvent):void {
			if (event.key === 'Enter' || event.key === ' ') {
				callback(event);
			}
		})
	);
}

export var click:(target:Widget, callback:Function) => IHandle = (function () {
	var CLICK_SPEED = 300;
	var MAX_DISTANCE = {
		pen: 15,
		mouse: 5,
		touch: 40
	};

	var numClicks:number = 0;
	var lastTimestamp:number;
	var lastX:number;
	var lastY:number;

	var resetNumClicks:() => void = util.debounce(function ():void {
		lastX = lastY = null;
		numClicks = 0;
	}, CLICK_SPEED);

	return function (target:Widget, callback:(event?:ui.ClickEvent) => void):IHandle {
		return util.createCompositeHandle(
			target.on('pointerdown', function (event:ui.PointerEvent):void {
				if (!event.isPrimary) {
					return;
				}

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
					callback(newEvent);
					resetNumClicks();
				}

				lastTimestamp = null;
			})
		);
	};
})();

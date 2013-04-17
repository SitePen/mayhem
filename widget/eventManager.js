define([
	'dojo/_base/array',
	'dojo/on'
], function (array, on) {

	var eventNormalizationMap = {
		focus: 'focusin',
		blur: 'focusout'
	};

	var widgetListenerMaps = {};
	var eventListenerMap = {};

	function hasWidgetListeners(eventType) {
		var widgetListenerMap = widgetListenerMaps[eventType];
		if (widgetListenerMap) {
			for (var widgetId in widgetListenerMap) {
				return true;
			}
		}

		return false;
	}

	function getTargetWidget(event) {
		var domNode = event.target;
		do {
			if (domNode.widget) { return true; }
		} while ((domNode = domNode.parentNode));
	}

	function findWidgetAncestry(widget) {
		var ancestry = [ widget ];
		for (var domNode = widget.parentNode; domNode; domNode = domNode.parentNode) {
			if (domNode.widget) {
				ancestry.push(domNode.widget);
			}
		}
		return ancestry;
	}

	function addCoreEventListener(eventType) {
		var listener = function (event) {
			var widgetTarget = getTargetWidget(event);
			if (widgetTarget) {
				return emitEvent(eventType, event);
			}
		};

		if (document.addEventListener) {
			document.addEventListener(eventType, listener, true);
		} else if (document.attachEvent)  {
			document.attachEvent('on' + eventType, listener);
		} else {
			throw new Error('Unable to add an event listener.');
		}

		return listener;
	}

	function removeCoreEventListener(eventType, listener) {
		if (document.removeEventListener) {
			document.addEventListener(eventType, listener, true);
		} else if (document.detachEvent)  {
			document.attachEvent('on' + eventType, listener);
		} else {
			throw new Error('Unable to remove an event listener.');
		}
	}

	function emitEvent(targetWidget, eventType, eventData) {
		var widgetListenerMap = widgetListenerMap[eventType];

		// short-circuit if we have no possible listeners
		if (!widgetListenerMap) { return; }

		var reservedKeys = { target: 1, preventDefault: 1, stopImmediatePropagation: 1 };
		var widgetEvent = { };
		for (var key in eventData) {
			if (eventData.hasOwnProperty(key) && !(key in reservedKeys)) {
				widgetEvent[key] = eventData[key];
			}
		}

		widgetEvent.target = targetWidget;

		var canBubble = !!event.bubbles;
		if (canBubble) {
			widgetEvent.stopImmediatePropagation = function () {
				canBubble = false;
			};
		}

		var canceled = false;
		if (event.preventDefault) {
			widgetEvent.preventDefault = function () {
				event.preventDefault();
				canceled = true;
			};
		}

		var relevantWidgets = canBubble ? findWidgetAncestry(targetWidget) : [ targetWidget ];

		do {
			var widget = relevantWidgets.shift(),
				widgetListeners = widgetListenerMap[widget.id];

			if (widgetListeners) {
				array.forEach(widgetListeners, function (listener) {
					listener.call(widget, widgetEvent);
				});
			}
		} while (canBubble && relevantWidgets.length > 0);

		return !canceled;
	}

	return {
		add: function (widget, eventType, listener) {
			var widgetId = widget.id;

			eventType = eventNormalizationMap[eventType] || eventType;

			// ensure there is a core listener for this type of event.
			if (!eventListenerMap[eventType]) {
				eventListenerMap[eventType] = addCoreEventListener(eventType);
			}

			var widgetListenerMap = widgetListenerMaps[eventType];
			if (!widgetListenerMap) {
				widgetListenerMap = widgetListenerMaps[eventType] = {};
			}

			var widgetListeners = widgetListenerMap[widgetId];
			if (!widgetListeners) {
				widgetListeners = widgetListenerMap[widgetId] = [];
			}

			widgetListeners.push(listener);

			var removed = false;
			return {
				remove: function () {
					if (!removed) {
						var listenerIndex = array.indexOf(widgetListeners, listener);
						if (listenerIndex >= 0) {
							if (widgetListeners.length === 1) {
								delete widgetListenerMap[widgetId];
								if (!hasWidgetListeners(eventType)) {
									removeCoreEventListener(eventType, eventListenerMap[eventType]);
									delete eventListenerMap[eventType];
								}
							} else {
								widgetListeners.splice(listenerIndex, 1);
							}
						} else {
							throw new Error(
								'Unable to find listener to remove for widget ' + widgetId + ' and event ' + eventType
							);
						}

						removed = true;
					}
				}
			};
		},

		emit: emitEvent
	};
});
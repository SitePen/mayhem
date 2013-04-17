define([
	'dojo/_base/array'
], function (array) {
	// summery:
	//		An event manager to manage all widgets' interaction with DOM events.

	var eventListenerMap = {};

	function getTargetWidget(domEvent) {
		// summary:
		//		Find the nearest encapsulating widget of a DOM event.

		var domNode = domEvent.target;
		do {
			if (domNode.widget) { return domNode.widget; }
		} while ((domNode = domNode.parentNode));

		return undefined;
	}

	function findWidgetAncestry(widget) {
		// summary:
		//		Find a widget's ancestry, including the widget itself

		var ancestry = [ widget ];
		for (var domNode = widget.domNode.parentNode; domNode; domNode = domNode.parentNode) {
			if (domNode.widget) {
				ancestry.push(domNode.widget);
			}
		}
		return ancestry;
	}

	function addRootEventListener(eventType) {
		// summary:
		//		Add an event listener to the document root to listen for all events in the document.

		var listener = function (event) {
			var targetWidget = getTargetWidget(event);
			if (targetWidget) {
				return eventManager.emit(targetWidget, eventType, event);
			}
		};

		if (document.addEventListener) {
			document.addEventListener(eventType, listener, true);
		} else if (document.attachEvent)  {
			document.attachEvent('on' + eventType, listener);
		} else {
			throw new Error('Unable to add an event listener for event type ' + eventType);
		}

		return listener;
	}

	function removeRootEventListener(eventType, listener) {
		// summary:
		//		Remove an event listener from the document root.

		if (document.removeEventListener) {
			document.removeEventListener(eventType, listener, true);
		} else if (document.detachEvent)  {
			document.detachEvent('on' + eventType, listener);
		} else {
			throw new Error('Unable to remove an event listener for event type ' + eventType);
		}
	}

	function requestWidgetListenerMap(eventType) {
		// summary:
		//		Request the widget listener map for the specified event type.

		// ensure there is a root listener for this type of event.
		if (!eventListenerMap[eventType]) {
			eventListenerMap[eventType] = addRootEventListener(eventType);
			eventListenerMap[eventType].widgetListenerMap = {};
		}
		return eventListenerMap[eventType].widgetListenerMap;
	}

	function releaseWidgetListenerMap(eventType) {
		// summary:
		// 		Release the widget listener map for the specified event type.

		var widgetListenerMap = eventListenerMap[eventType].widgetListenerMap;

		// check if there are any widget listeners left in the map
		var hasWidgetListeners = false;
		for (var widgetId in widgetListenerMap) {
			// hack: using widgetId to avoid linter error about unreferenced variable. A better approach is welcome.
			widgetId = widgetId;
			hasWidgetListeners = true;
			break;
		}

		// remove the root listener if it is no longer needed
		if (!hasWidgetListeners) {
			removeRootEventListener(eventType, eventListenerMap[eventType]);
			delete eventListenerMap[eventType];
		}
	}

	function addWidgetListener(widget, eventType, listener) {
		// summary:
		//		Add a listener for the specified widget and event type.

		var widgetListenerMap = requestWidgetListenerMap(eventType),
			widgetListeners = widgetListenerMap[widget.id];
		if (!widgetListeners) {
			widgetListeners = widgetListenerMap[widget.id] = [];
		}

		widgetListeners.push(listener);

		var removed = false;
		return {
			remove: function () {
				if (!removed) {
					removeWidgetListener(widget, eventType, listener);
					removed = true;
				}
			}
		};
	}

	function removeWidgetListener(widget, eventType, listener) {
		// summary:
		// 		Remove a listener for the specified widget and event type

		var widgetListenerMap = eventListenerMap[eventType].widgetListenerMap,
			widgetListeners = widgetListenerMap[widget.id],
			listenerIndex = array.indexOf(widgetListeners, listener);

		if (listenerIndex >= 0) {
			widgetListeners.splice(listenerIndex, 1);
		} else {
			throw new Error(
				'Unable to find listener to remove for widget ' + widget.id + ' and event ' + eventType
			);
		}

		// remove the widget's entry in the map if it has no more listeners
		if (widgetListeners.length === 0) {
			delete widgetListenerMap[widget.id];
		}
		releaseWidgetListenerMap(eventType);
	}

	var eventManager = {
		// TODO: I'm not sure how to document with package-specific types. Learn and annotate these parameters.
		add: function (widget, /*String*/ eventType, /*Function*/ listener) {
			// summary:
			//		Add an event listener for the specified type and widget
			// widget:
			//		The widget to listen on
			// eventType:
			//		The event type to listen for
			// listener:
			//		The listener to be called when the event occurs
			var eventNormalizationMap = {
				focus: 'focusin',
				blur: 'focusout'
			};
			eventType = eventNormalizationMap[eventType] || eventType;
			return addWidgetListener(widget, eventType, listener);
		},
		// TODO: I'm not sure how to document with package-specific types. Learn and annotate these parameters.
		emit: function (targetWidget, /*String*/ eventType, /*Object?*/ eventData) {
			// summary:
			//		Emit an event
			// targetWidget:
			//		The widget targetted by the event
			// eventType:
			//		The type of event
			// eventData:
			// 		Data associated with the event

			var rootEventListener = eventListenerMap[eventType];

			// short-circuit if we have no possible listeners
			if (!rootEventListener) { return; }

			// create the widget event based on the event data
			eventData = eventData || {};
			var reservedKeys = { target: 1, preventDefault: 1, stopPropagation: 1 };
			var widgetEvent = { };
			for (var key in eventData) {
				if (eventData.hasOwnProperty(key) && !(key in reservedKeys)) {
					widgetEvent[key] = eventData[key];
				}
			}
			widgetEvent.target = targetWidget;
			widgetEvent.type = eventType;

			// make sure event.bubbles is a boolean value
			widgetEvent.bubbles = !!eventData.bubbles;

			// make sure event.cancelable is a boolean value
			widgetEvent.cancelable = !!eventData.cancelable;

			var canBubble = !!widgetEvent.bubbles;
			if (canBubble) {
				widgetEvent.stopPropagation = function () {
					canBubble = false;
				};
			}

			var canceled = false;
			if (widgetEvent.cancelable) {
				widgetEvent.preventDefault = function () {
					if (eventData.preventDefault) {
						eventData.preventDefault();
					}
					canceled = true;
				};
			}

			var widgetListenerMap = rootEventListener.widgetListenerMap,
				relevantWidgets = canBubble ? findWidgetAncestry(targetWidget) : [ targetWidget ];

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
	};

	return eventManager;
});
define([
	'dojo/_base/array'
], function (array) {
	// summery:
	//		An event manager to manage all widget event listeners and emissions.

	var eventListenerMap = {};

	function SharedListener(initializeSharedListener) {
		this.listeners = [];

		if (initializeSharedListener) {
			this._sharedListenerHandle = initializeSharedListener();
		}
	}
	SharedListener.prototype = {
		listeners: null,
		_sharedListenerHandle: null,
		remove: function () {
			this._sharedListenerHandle && this._sharedListenerHandle.remove();
		},
		addListener: function (listener) {
			this.listeners.push(listener);
		},
		removeListener: function (listener) {
			var listeners = this.listeners,
				listenerIndex = array.indexOf(listeners, listener);

			if (listenerIndex >= 0) {
				listeners.splice(listenerIndex, 1);
			} else {
				throw new Error('Unable to find listener to remove');
			}
		}
	};

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

	function requestWidgetListenerMap(eventType) {
		// summary:
		//		Request the widget listener map for the specified event type.

		return eventListenerMap[eventType] || (eventListenerMap[eventType] = {});
	}

	function releaseWidgetListenerMap(eventType) {
		// summary:
		// 		Release the widget listener map for the specified event type.

		var widgetListenerMap = eventListenerMap[eventType];

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
			delete eventListenerMap[eventType];
		}
	}

	var eventManager = {
		// TODO: I'm not sure how to document with package-specific types. Learn and annotate these parameters.
		add: function (widget, /*String*/ eventType, /*Function*/ listener, /*Function?*/ initializeSharedListener) {
			// summary:
			//		Add an event listener for the specified type and widget
			// widget:
			//		The widget to listen on
			// eventType:
			//		The event type to listen for
			// listener:
			//		The listener to be called when the event occurs
			// initializeSharedListener:
			//		Called when initializing a shared listener to encapsulate the widget initialization
			//		required to start emitting the event.

			var widgetListenerMap = requestWidgetListenerMap(eventType),
			sharedListener = widgetListenerMap[widget.id];
			if (!sharedListener) {
				sharedListener = widgetListenerMap[widget.id] = new SharedListener(initializeSharedListener);
			}

			sharedListener.addListener(listener);

			var removed = false;
			return {
				remove: function () {
					if (!removed) {
						sharedListener.removeListener(listener);
						if (sharedListener.listeners.length === 0) {
							sharedListener.remove();
							delete widgetListenerMap[widget.id];
						}

						releaseWidgetListenerMap(eventType);
						removed = true;
					}
				}
			};
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

			var widgetListenerMap = eventListenerMap[eventType];

			// short-circuit if we have no possible listeners
			if (!widgetListenerMap) { return; }

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

			var relevantWidgets = canBubble ? findWidgetAncestry(targetWidget) : [ targetWidget ];

			do {
				var widget = relevantWidgets.shift();

				if (widgetListenerMap[widget.id]) {
					array.forEach(widgetListenerMap[widget.id].listeners, function (listener) {
						listener.call(widget, widgetEvent);
					});
				}
			} while (canBubble && relevantWidgets.length > 0);

			return !canceled;
		}
	};

	return eventManager;
});
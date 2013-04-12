define([
	'dojo/_base/lang',
	'dojo/aspect',
	'dojo/_base/declare',
	'dojo/Stateful',
	/*====='dojo/Evented',=====*/
	'dojo/dom-construct',
	'dojo/dom-style',
	'dojo/dom-class',
	'dojo/on'
], function (lang, aspect, declare, Stateful,/*===== Evented,=====*/ domConstruct, domStyle, domClass, on) {

	function WidgetEvent(type, target, eventProperties) {
		// TODO: This will mixin DOM events' preventDefault and stopPropagation method. Do they need bound to the original event?
		lang.mixin(this, eventProperties);
		this.type = type;
		this.target = target;
	}
	WidgetEvent.prototype.preventDefault = function () {
		this.cancelable = false;
	};
	WidgetEvent.prototype.stopPropagation = function () {
		this.bubbles = false;
	};

	var nextWidgetIdCounter = 0;

	var base = Stateful;
	/*=====base = [ base, Evented ];=====*/

	return declare(base, {
		// summary:
		//		The base class of all widgets.

		// id: [readonly] String
		// 		The widget identifier
		id: null,

		// domNode: [readonly] DomNode
		//		The root of this widget's DOM representation.
		domNode: null,

		// className: String
		//		A CSS class name for this widget.
		className: null,

		// _ownedHandles: Array
		//		The collection of handles owned by this widget.
		// tags:
		//		private
		_ownedHandles: null,

		// _eventListenerMap: Object
		//		A map of event listeners by event type.
		// tags:
		//		private
		_eventListenerMap: null,

		// _domEventProxies: Object
		//		A map of DOM event proxies by event type.
		// tags:
		//		private
		_domEventProxies: null,

		// TODO: srcNodeRef is a poor name. Think of a better name.
		constructor: function (/*=====propertiesToMixIn, srcNodeRef=====*/) {
			// summary:
			//		Create the widget.
			// propertiesToMixin: Object|null?
			//		The properties that will be mixed into this widget.
			// srcNodeRef: DomNode|String?
			//		A reference to a DOM node to replace with this widget.

			this._ownedHandles = [];
			this._eventListenerMap = {};
			this._domEventProxies = {};
		},

		postscript: function (/*Object|null?*/ propertiesToMixIn, /*DomNode|String?*/ srcNodeRef) {
			// summary:
			// 		Complete widget instantiation.
			// tags:
			//		private

			if (this.id === null) {
				this.id = 'mayhem-widget-' + (nextWidgetIdCounter++);
			}

			this._create(propertiesToMixIn);
			this.domNode.widget = this;

			// Call inherited postscript so dojo/Stateful can mix in properties.
			this.inherited(arguments);

			if (srcNodeRef) {
				domConstruct.place(this.domNode, srcNodeRef, 'replace');
			}
		},

		_create: function (/*=====propertiesToMixIn=====*/) {
			// summary:
			// 		Create the widget's DOM representation.
			// propertiesToMixin: Object|null?
			//		The properties that will be mixed into this widget.
			// tags:
			//		protected
			if (this.domNode === null) {
				this.domNode = domConstruct.create('div');
			}
		},

		startup: function () {
			// summary:
			//		Perform initialization after the widget is added to the DOM.

			// Do nothing. This method is provided because startup() is assumed to exist on all widget instances.
		},

		destroy: function () {
			// summary:
			//		Destroy the widget.
			// description:
			//		This method destroys the widget and frees associated resources.
			delete this.domNode.widget;
			domConstruct.destroy(this.domNode);

			// Clean up owned handles
			while (this._ownedHandles.length > 0) {
				this._ownedHandles.pop().remove();
			}
		},

		own: function (/*Object...*/) {
			// summary:
			//		Takes ownership of one or more handles.
			var ownedHandles = this._ownedHandles;
			ownedHandles.push.apply(ownedHandles, arguments);
		},

		// TODO: Revisit this. It is strange since it's not really a setter; though, it is nice to be able to specify styles in the properties passed to the constructor.
		_styleSetter: function (kwStyleArgs) {
			// summary:
			//		Apply the specified styles to the widget.
			// kwStyleArgs: Object
			//		A hash of styles to set for the widget.
			domStyle.set(this.domNode, kwStyleArgs);
		},

		_classNameSetter: function (className) {
			// summary:
			//		Set a CSS class for this widget.
			// description:
			// 		This method sets a CSS class for this widget. It replaces the current CSS class applied
			//		through this setter but leaves other CSS classes intact.
			// className: String
			//		The name of the CSS class to apply.

			if (this.className) {
				domClass.remove(this.domNode, this.className);
			}

			if (className) {
				domClass.add(this.domNode, className);
			}
			this.className = className;
		},

		_registerDomEventProxy: function (/*String*/ type) {
			// summary:
			//		Register the need for a DOM event proxy that proxies DOM events to widget events.
			// description:
			//		This method registers the need for a DOM event listener to emit those events as widget events.
			//		When the event is emitted by the DOM, the widget emits a corresponding widget event.
			//		No matter how many listeners are registered for the widget event,
			//		only one listener is ever registered per DOM event. Once all corresponding widget
			//		event listeners have been removed, the corresponding DOM event listener is removed as well.
			// type:
			//		The event type.
			// returns: Object
			//		An object with a remove() method to unregister for the event proxy.
			// tags:
			//		private
			var domEventProxies = this._domEventProxies,
				widget = this;

			var domEventProxy = domEventProxies[type];
			if (!domEventProxy) {
				domEventProxy = domEventProxies[type] = {
					referenceCount: 0,
					proxyHandle: on(widget.domNode, type, function (event) {
						widget.emit(type, event);
					}),
					handle: {
						remove: function () {
							domEventProxy.referenceCount--;
							if (domEventProxy.referenceCount === 0) {
								domEventProxy.proxyHandle.remove();
								delete domEventProxies[type];
							}
						}
					}
				};
			}

			domEventProxy.referenceCount++;

			return domEventProxy.handle;
		},

		// TODO: Test DOM event bubbling and canceling
		on: function (/*String|Function*/ type, /*Function*/ listener) {
			// summary:
			//		Add a listener for the specified event type.
			// description:
			//		This method adds an event listener for the specified event type.
			//		When the listener is called, `this` refers to the widget.
			// type:
			//		The event type to listen for
			// listener:
			//		The function that is called when the specified event occurs
			// returns: Object
			//		An object with a remove() method to remove the event listener

			var domListenerHandle = this._registerDomEventProxy(type),
				widgetListenerHandle = aspect.after(this._eventListenerMap, 'on' + type, listener, true),
				aggregateHandleRemoved = false,
				aggregateHandle = {
					remove: function () {
						if (!aggregateHandleRemoved) {
							domListenerHandle.remove();
							widgetListenerHandle.remove();
						}
					}
				};
			this.own(aggregateHandle);
			return aggregateHandle;
		},

		emit: function (/*String*/ type, /*Object*/ event) {
			// summary:
			//		Emit a widget event.
			// type:
			// 		The event type
			// event:
			//		The event to emit
			// tags:
			// 		protected

			event = new WidgetEvent(this, type, event);

			var domNode = this.domNode,
				widget,
				listener;
			do {
				widget = domNode.widget;
				listener = widget && widget._eventListenerMap['on' + type];
				if (listener) {
					listener.call(widget, event);
				}
			} while (event && event.bubbles && (domNode = domNode.parentNode));

			return event.cancelable && event;
		}
	});
});
define([
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/aspect',
	'dojo/_base/declare',
	'dojo/Stateful',
	/*====='dojo/Evented',=====*/
	'dojo/dom',
	'dojo/dom-construct',
	'dojo/dom-style',
	'dojo/dom-class',
	'dojo/dom-attr',
	'dojo/query',
	'dojo/on',
	'./pointer'
], function (lang, array, aspect, declare, Stateful,/*===== Evented,=====*/ dom, domConstruct, domStyle, domClass, domAttr, query, on, pointer) {

	var INSERTION_POINT_ATTRIBUTE = 'data-dojo-insertion-point';
	// TODO: Perhaps this should be data-dojo-selection-criteria?
	var SELECTION_CRITERIA_ATTRIBUTE = 'data-dojo-content-select';

	var selectionTestNode = domConstruct.create('div');
	function widgetMeetsSelectionCriteria(widget, selectionCriteria) {
		try {
			// NOTE: A side effect of this approach is that a widget that
			// is already in the DOM will be removed from its current home.
			// I'm not sure yet whether that is something that will occur
			// in practice with these containers.
			selectionTestNode.appendChild(widget.domNode);

			// Select only direct children
			if (!/^\s*>\s*/.test(selectionCriteria)) {
				selectionCriteria = '>' + selectionCriteria;
			}
			return query(selectionCriteria, selectionTestNode).length > 0;
		}
		finally {
			selectionTestNode.innerHTML = '';
		}
	}

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

		// TODO: Change this name.
		_sharedListenerMap: null,

		// _started: Boolean
		//		Whether or not startup() has been called on this widget.
		_started: false,

		// _destroyed: Boolean
		//		Whether this widget has been destroyed.
		_destroyed: false,

		// _insertionPoints: Array
		_insertionPoints: null,

		// TODO: srcNodeRef is a poor name. Think of a better name.
		constructor: function (/*=====propertiesToMixIn, srcNodeRef=====*/) {
			// summary:
			//		Create the widget.
			// propertiesToMixin: Object|null?
			//		The properties that will be mixed into this widget.
			// srcNodeRef: DomNode|String?
			//		A reference to a DOM node to replace with this widget.

			this._ownedHandles = [];
			this._sharedListenerMap = {};
		},

		postscript: function (/*Object|null?*/ propertiesToMixIn, /*DomNode|String?*/ srcNodeRef) {
			// summary:
			// 		Complete widget instantiation.
			// tags:
			//		private

			var id = (propertiesToMixIn && propertiesToMixIn.id) || ('mayhem-widget-' + (nextWidgetIdCounter++));

			this._create(propertiesToMixIn, srcNodeRef);
			this.domNode.id = this.id = id;
			this.domNode.widget = this;

			this._insertionPoints = query('[' + INSERTION_POINT_ATTRIBUTE + ']', this.domNode);

			// Call inherited postscript so dojo/Stateful can mix in properties.
			this.inherited(arguments, [ propertiesToMixIn ]);

			// Replace reference node after widget is fully initialized so
			// we only modify the DOM on successful construction.
			// TODO: Remove the ancestry checks when no longer proxying to Dijits. They are baggage.
			srcNodeRef = dom.byId(srcNodeRef);
			if (srcNodeRef && srcNodeRef.parentNode && !dom.isDescendant(srcNodeRef, this.domNode)) {
				domConstruct.place(this.domNode, srcNodeRef, 'replace');
			}
		},

		_create: function (/*=====propertiesToMixIn, srcNodeRef=====*/) {
			// summary:
			// 		Create the widget's DOM representation.
			// propertiesToMixin: Object|null?
			//		The properties that will be mixed into this widget.
			// srcNodeRef: DomNode|String?
			//		A DOM reference point for this widget's construction
			// tags:
			//		protected
			if (this.domNode === null) {
				this.domNode = domConstruct.create('div');
			}

			domClass.add(this.domNode, 'widget');
		},

		// TODO: Change name or improve documentation to distinguish the role of this method from the public destroy() API
		_destroy: function () {
			// summary:
			//		Destroy this widget.
			// description:
			//		Override this method to add other destruction logic to your widget.
			//		Don't forget to call this.inherited(arguments).
			// tags:
			//		protected

			delete this.domNode.widget;

			// Clean up owned handles
			while (this._ownedHandles.length > 0) {
				this._ownedHandles.pop().remove();
			}
		},

		startup: function () {
			// summary:
			//		Perform initialization after the widget is added to the DOM.

			this._started = true;
		},

		destroy: function () {
			// summary:
			//		Destroy the widget and all descendant widgets in a post-order, depth-first traversal.

			if (this._destroyed) {
				return;
			}

			// Get a NodeList including this widget's DOM node
			// representing a depth-first traversal of this widget and its descendants
			var doomedWidgets = query('.widget', this.domNode);

			// Insert this widget as the root to make recursive algorithm cleaner.
			doomedWidgets.unshift(this.domNode);

			function destroyRecursively(currentIndex) {
				var currentNode = doomedWidgets[currentIndex],
					nextIndex = currentIndex + 1;

				while (nextIndex < doomedWidgets.length && currentNode.contains(doomedWidgets[nextIndex])) {
					nextIndex = destroyRecursively(nextIndex);
				}

				currentNode.widget._destroy();

				return nextIndex;
			}

			// Begin with this widget
			destroyRecursively(0);

			// Remove this widget and its descendants from the DOM
			domConstruct.destroy(this.domNode);

			this._destroyed = true;
		},

		// TODO: Implement this richer interface.
		//addChild: function (childWidget, positionSpecifier, referenceWidget) {
		// NOTE: This appears to be the interface we require if we're to support ShadowDOM-like insertion points. No more inserting by index.
		// The idea is to provide a relative position specifier so the container knows where to add the child in the insertion point.
		// If the position specifier requires a sibling point of reference, a reference widget may be provided as the third argument.
		// FOR NOW: Using a simpler interface for an initial append-only implementation
		addChild: function (childWidget) {
			// summary:
			//		Add a child widget.

			var insertionPoints = this._insertionPoints,
				childDistributed = false;
			for (var i = 0; i < insertionPoints.length && !childDistributed; i++) {
				var selectionCriteria = domAttr.get(insertionPoints[i], SELECTION_CRITERIA_ATTRIBUTE);

				if (!selectionCriteria || widgetMeetsSelectionCriteria(childWidget, selectionCriteria)) {
					insertionPoints[i].appendChild(childWidget.domNode);
					childDistributed = true;
				}
			}

			// If the child wasn't distributed to an insertion point, append it to the widget.
			if (!childDistributed) {
				this.domNode.appendChild(childWidget.domNode);
			}

			// TODO: Test that this is occuring.
			if (this._started) {
				childWidget.startup();
			}
		},

		removeChild: function (childWidget) {
			// summary:
			//		Remove a child widget.

			var childNode = childWidget.domNode,
				parentNode = childNode.parentNode;

			if (!this.domNode.contains(childNode)) {
				throw new Error('No child found with id ' + childWidget.id);
			}

			parentNode.removeChild(childNode);
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

		_tabIndexGetter: function () {
			return this.domNode.tabIndex;
		},

		_tabIndexSetter: function (/*Number*/ tabIndex) {
			// summary:
			//		Set the tab index for this widget.
			// tabIndex:
			//		The widget's tab index

			this.domNode.tabIndex = tabIndex;
		},

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

			var sharedListenerMap = this._sharedListenerMap,
				sharedListener = sharedListenerMap[type];

			if (!sharedListener) {
				// TODO: What is a better naming convention?	
				var listenerInitMethod = '_' + type + 'InitListener';

				sharedListener = sharedListenerMap[type] = {};
				sharedListener.listeners = [];
				if (listenerInitMethod in this) {
					sharedListener.handle =	this[listenerInitMethod]();
				}
			}

			sharedListener.listeners.push(listener);

			var removed = false;
			var handle = {
				remove: function () {
					if (!removed) {
						var listenerIndex = array.indexOf(sharedListener.listeners, listener);
						sharedListener.listeners.splice(listenerIndex, 1);

						if (sharedListener.listeners.length === 0) {
							sharedListener.handle && sharedListener.handle.remove();
							delete sharedListenerMap[type];
						}

						removed = true;
					}
				}
			};
			this.own(handle);
			return handle;
		},

		emit: function (/*String*/ type, /*Object?*/ eventData) {
			// summary:
			//		Emit a widget event.
			// type:
			// 		The event type
			// event:
			//		The event to emit
			// tags:
			// 		protected

			// create the widget event based on the event data
			eventData = eventData || {};
			var reservedKeys = { target: 1, preventDefault: 1, stopPropagation: 1 };
			var widgetEvent = { };
			for (var key in eventData) {
				if (eventData.hasOwnProperty(key) && !(key in reservedKeys)) {
					widgetEvent[key] = eventData[key];
				}
			}
			widgetEvent.target = this;
			widgetEvent.type = type;

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

			var domNode = this.domNode;
			do {
				var widget = domNode.widget;
				if (widget) {
					var widgetSharedListener = widget._sharedListenerMap[type];

					if (widgetSharedListener) {
						array.forEach(widgetSharedListener.listeners, function (listener) {
							listener.call(widget, widgetEvent);
						});
					}
				}
			} while (canBubble && (domNode = domNode.parentNode));

			return !canceled;
		},

		focus: function () {
			// summary:
			//		Set focus on this widget
			this.domNode.focus();
		},

		// TODO: Determine supported interface for all pointer event objects.
		_initDomListenerProxy: function (domEventType, widgetEventType) {
			widgetEventType = widgetEventType || domEventType;

			return on(this.domNode, domEventType, lang.hitch(this, function (event) {
				// The Widget event system needs to take responsibility for bubbling;
				// otherwise, an inner widget and an outer widget will receive the same
				// DOM event and both emit bubbling widget events.
				if (event.bubbles) {
					event.stopPropagation();
				}

				return this.emit(widgetEventType, event);
			}));
		},

		_focusInitListener: function () {
			return this._initDomListenerProxy('focusin', 'focus');
		},

		_blurInitListener: function () {
			return this._initDomListenerProxy('focusout', 'blur');
		},

		_keydownInitListener: function () {
			return this._initDomListenerProxy('keydown');
		},

		_keyupInitListener: function () {
			return this._initDomListenerProxy('keyup');
		},

		_pointerdownInitListener: function () {
			return this._initDomListenerProxy(pointer.down, 'pointerdown');
		},

		_pointerupInitListener: function () {
			return this._initDomListenerProxy(pointer.up, 'pointerup');
		},

		_pointercancelInitListener: function () {
			return this._initDomListenerProxy(pointer.cancel, 'pointercancel');
		},

		_pointermoveInitListener: function () {
			return this._initDomListenerProxy(pointer.move, 'pointermove');
		},

		_pointeroverInitListener: function () {
			return this._initDomListenerProxy(pointer.over, 'pointerover');
		},

		_pointeroutInitListener: function () {
			return this._initDomListenerProxy(pointer.out, 'pointerout');
		},

		_pointerenterInitListener: function () {
			return this._initDomListenerProxy(pointer.enter, 'pointerenter');
		},

		_pointerleaveInitListener: function () {
			return this._initDomListenerProxy(pointer.leave, 'pointerleave');
		},

		_clickInitListener: function () {
			return this._initDomListenerProxy('click');
		}

		// onFocus:
		//		When the widget gets the focus.

		// onBlur:
		//		When the widget loses the focus.

		// onPointerdown:
		//		When a pointer enters the active buttons state.

		// onPointerup:
		//		When a pointer leaves the active buttons state.

		// onPointercancel:
		//		When a pointer is unlikely to continue producing events.

		// onPointermove:
		//		When a pointer changes coordinates, button state, pressure, tilt, or contact geometry (e.g., width and height)

		// onPointerover:
		//		When a pointer is moved into the hit test boundaries of a widget
		//		and before emitting pointerdown on a device that does not support hover.

		// onPointerout:
		//		When a pointer is moved out of the hit test boundaries of a widget,
		//		after emitting pointerup for a device that does not support hover,
		//		and after emitting pointercancel.

		// onPointerenter:
		//		When a pointer is moved into the hit test boundaries of a widget,
		//		including as a result of pointerdown on a device that does not support hover.

		// onPointerleave:
		// 		When a pointer is moved off of the hit test boundaries of a widget,
		//		including as a result of pointerup on a device that does not support hover.

		// onClick:
		//		When the widget is clicked.
	});
});
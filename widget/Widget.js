define([
	'dojo/_base/lang',
	'dojo/aspect',
	'dojo/_base/declare',
	'dojo/Stateful',
	/*====='dojo/Evented',=====*/
	'dojo/dom',
	'dojo/dom-construct',
	'dojo/dom-style',
	'dojo/dom-class',
	'dojo/query',
	'dojo/on',
	'./pointer',
	'./eventManager'
], function (lang, aspect, declare, Stateful,/*===== Evented,=====*/ dom, domConstruct, domStyle, domClass, query, on, pointer, eventManager) {

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

		// _destroyed: Boolean
		//		Whether this widget has been destroyed.
		_destroyed: false,

		// TODO: srcNodeRef is a poor name. Think of a better name.
		constructor: function (/*=====propertiesToMixIn, srcNodeRef=====*/) {
			// summary:
			//		Create the widget.
			// propertiesToMixin: Object|null?
			//		The properties that will be mixed into this widget.
			// srcNodeRef: DomNode|String?
			//		A reference to a DOM node to replace with this widget.

			this._ownedHandles = [];
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

			// Do nothing. This method is provided because startup() is assumed to exist on all widget instances.
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

			// TODO: What is a better naming convention?	
			var listenerInitMethod = '_' + type + 'InitListener',
				initializeSharedListener = (listenerInitMethod in this) ? lang.hitch(this, listenerInitMethod) : undefined;

			var handle = eventManager.add(this, type, listener, initializeSharedListener);
			this.own(handle);
			return handle;
		},

		emit: function (/*String*/ type, /*Object?*/ event) {
			// summary:
			//		Emit a widget event.
			// type:
			// 		The event type
			// event:
			//		The event to emit
			// tags:
			// 		protected

			return eventManager.emit(this, type, event);
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
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
	'dojo/on',
	'./pointer',
	'./eventManager'
], function (lang, aspect, declare, Stateful,/*===== Evented,=====*/ dom, domConstruct, domStyle, domClass, on, pointer, eventManager) {

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

			if (this.id === null) {
				this.id = 'mayhem-widget-' + (nextWidgetIdCounter++);
			}

			this._create(propertiesToMixIn, srcNodeRef);
			this.domNode.widget = this;

			// Call inherited postscript so dojo/Stateful can mix in properties.
			this.inherited(arguments);

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

		// TODO: Determine supported interface for all pointer events.
		_initListener: function (eventType, internalListener) {
			var handle = on(this.domNode, eventType, internalListener);
			this.own(handle);
			return handle;
		},

		_pointerdownInitListener: function () {
			return this._initListener(pointer.down, lang.hitch(this, 'emit', 'pointerdown'));
		},

		_pointerupInitListener: function () {
			return this._initListener(pointer.up, lang.hitch(this, 'emit', 'pointerup'));
		},

		_pointercancelInitListener: function () {
			return this._initListener(pointer.cancel, lang.hitch(this, 'emit', 'pointercancel'));
		},

		_pointermoveInitListener: function () {
			return this._initListener(pointer.move, lang.hitch(this, 'emit', 'pointermove'));
		},

		_pointeroverInitListener: function () {
			return this._initListener(pointer.over, lang.hitch(this, 'emit', 'pointerover'));
		},

		_pointeroutInitListener: function () {
			return this._initListener(pointer.out, lang.hitch(this, 'emit', 'pointerout'));
		},

		_pointerenterInitListener: function () {
			return this._initListener(pointer.enter, lang.hitch(this, 'emit', 'pointerenter'));
		},

		_pointerleaveInitListener: function () {
			return this._initListener(pointer.leave, lang.hitch(this, 'emit', 'pointerleave'));
		},

		_clickInitListener: function () {
			return this._initListener('click', lang.hitch(this, 'emit', 'click'));
		}
	});
});
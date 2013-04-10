define([
	'dojo/_base/declare',
	'dojo/Stateful',
	'dojo/dom-construct',
	'dojo/dom-style',
	'dojo/dom-class'
], function (declare, Stateful, domConstruct, domStyle, domClass) {
	return declare(Stateful, {
		// summary:
		//		The base class of all widgets.

		// domNode: [readonly] DomNode
		//		The root of this widget's DOM representation.
		domNode: null,

		// className: String
		//		A CSS class name for this widget.
		className: null,

		// _ownedHandles: Array
		//		The collection of handles owned by this widget.
		_ownedHandles: null,

		// TODO: srcNodeRef is a poor name. Think of a better name.
		constructor: function (/*propertiesToMixIn, srcNodeRef*/) {
			// summary:
			//		Create the widget.
			// propertiesToMixin: Object|null?
			//		The properties that will be mixed into this widget.
			// srcNodeRef: DomNode|String?
			//		A reference to a DOM node to replace with this widget.

			this._ownedHandles = [];
		},

		postscript: function (propertiesToMixIn, srcNodeRef) {
			this._create(propertiesToMixIn);
			this.domNode.widget = this;

			// Call inherited postscript so dojo/Stateful can mix in properties.
			this.inherited(arguments);

			if (srcNodeRef) {
				domConstruct.place(this.domNode, srcNodeRef, 'replace');
			}
		},

		_create: function () {
			// summary:
			// 		Create the widget's DOM representation.
			// propertiesToMixIn: Object|null?
			//		The properties that will be mixed into this widget.
			// tags:
			//		protected
			if (this.domNode === null) {
				this.domNode = domConstruct.create('div');
			}
		},

		/*=====
		startup: function () {
			// summary:
			//		Perform initialization after the widget is added to the DOM.
		},
		=====*/

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

		own: function (handle) {
			// summary:
			//		Take ownership of a handle with a remove() method.
			// handle: Object
			//		A handle object with a remove() method.
			this._ownedHandles.push(handle);
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
		}
	});
});
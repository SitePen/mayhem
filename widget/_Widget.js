define([
	'dojo/_base/declare',
	'dojo/Stateful',
	'dojo/dom-construct'
], function (declare, Stateful, domConstruct) {
	return declare(Stateful, {
		// summary:
		//		The base class of all widgets.

		// domNode: [readonly] DomNode
		//		The root of this widget's DOM representation.
		domNode: null,

		// TODO: srcNodeRef is a poor name. Think of a better name.
		/*=====
		constructor: function (propertiesToMixIn, srcNodeRef) {
			// summary:
			//		Create the widget.
			// propertiesToMixin: Object|null?
			//		The properties that will be mixed into this widget.
			// srcNodeRef: DomNode|String?
			//		A reference to a DOM node to replace with this widget.
		},
		=====*/

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
			delete this.domNode.widget;
			domConstruct.destroy(this.domNode);
		}
	});
});
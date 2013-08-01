define([
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/_base/declare',
	'dojo/dom-construct',
	'./Node'
], function (lang, arrayUtil, declare, domConstruct, Node) {
	return declare(Node, {
		// summary:
		//		Template node that generates content for each item in a collection.

		// Widget: Function
		//		The constructor for the Widget represented by this node.
		Widget: null,

		// staticProperties: Object
		//		Unbound property values for the widget
		staticProperties: null,

		// boundProperties: Object
		//		A map of property names to AttributeBinding objects
		boundProperties: null,

		// eventMap: Object
		//		A map of event names to DataBindingExpressions for event handlers
		eventMap: null,

		// widget: framework/widget/Widget
		//		The widget instance
		widget: null,

		_create: function (kwArgs) {
			this.inherited(arguments);

			var widget = this.widget = new this.Widget(this.staticProperties);

			var boundProperties = this.boundProperties;
			for (var key in boundProperties) {
				this.own(boundProperties[key].bind(kwArgs.bindingContext, lang.hitch(widget, "set", key)));
			}

			var eventMap = this.eventMap;
			for (var key in eventMap) {
				widget.on(key, eventMap[key].getValue(kwArgs.bindingContext));
			}

			// Associate widget with view model
			widget.set('viewModel', kwArgs.view.viewModel);

			domConstruct.place(widget.domNode, this.beginMarker, 'after');

			// TODO: Change framework/widget/Widget fieldName to dataField to match the template syntax we're using
		},

		destroy: function () {
			this.widget.destroy();
			this.inherited(arguments);
		}
	});
});

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

		// each: DataBindingExpression
		//		An expression indicating what collection to bind to
		propertyMap: null,

		// widget: framework/widget/Widget
		//		The widget instance
		widget: null,

		_create: function (kwArgs) {
			this.inherited(arguments);

			var widget = this.widget = new this.Widget();

			var propertyMap = this.propertyMap;
			for (var key in propertyMap) {
				widget.set(key, propertyMap[key]);
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
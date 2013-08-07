define([
	'dojo/_base/declare',
	'dojo/dom-construct',
	'../../../widget/Widget'
], function (declare, domConstruct, Widget) {
	// Widget for testing bubbling events.
	return declare(Widget, {
		_innerWidget: null,
		_create: function () {
			this.inherited(arguments);

			// Add a div between the two widgets to make sure events can bubble
			// up through HTML elements not associated with widgets.
			var anotherDiv = domConstruct.create('div');
			this.domNode.appendChild(anotherDiv);

			this._innerWidget = new Widget();
			anotherDiv.appendChild(this._innerWidget.domNode);
		},
		destroy: function () {
			this._innerWidget.destroy();
			this.inherited(arguments);
		}
	});
});

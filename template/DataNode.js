define([
	'dojo/_base/declare',
	'./Node',
	'dojo/dom-construct'
], function (declare, Node, domConstruct) {
	return declare(Node, {
		// summary:
		//		Template node representing raw text or HTML.

		// safe: boolean
		//		A boolean indicating whether the content is safe or should be HTML-escaped
		safe: false,

		// var: DataBindingExpression
		//		An expression indicating the value bound to this node
		'var': null,

		_create: function (kwArgs) {
			this.inherited(arguments);

			var dataNode = this;

			this.var.bind(kwArgs.bindingContext, function (value) {
				dataNode._removeContent();

				var newContent = dataNode.safe ? domConstruct.toDom(value) : document.createTextNode(value);
				domConstruct.place(newContent, dataNode.beginMarker, 'after');
			});
		},

		_removeContent: function () {
			// summary:
			//		Removes the current content for this template node.

			// TODO: Support IE8, which doesn't support ranges
			var range = document.createRange();
			range.setStartAfter(this.beginMarker);
			range.setEndBefore(this.endMarker);
			range.deleteContents();
			range.detach();
		}
	});
});
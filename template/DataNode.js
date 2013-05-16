define([
	'dojo/_base/declare',
	'./BoundNode',
	'dojo/dom-construct'
], function (declare, BoundNode, domConstruct) {
	return declare(BoundNode, {
		safe: false,
		'var': null,

		_bind: function (view) {
			var dataNode = this;

			this.var.bind(view, function (value) {
				dataNode._removeContent();

				var newContent = dataNode.safe ? domConstruct.toDom(value) : document.createTextNode(value);
				domConstruct.place(newContent, dataNode.beginMarker, 'after');
			});
		},

		_removeContent: function () {
			// TODO: Support IE8, which doesn't support ranges
			var range = document.createRange();
			range.setStartAfter(this.beginMarker);
			range.setEndBefore(this.endMarker);
			range.deleteContents();
			range.detach();
		}
	});
});
define([
	'dojo/_base/declare',
	'./BoundNode'
], function (declare, BoundNode) {
	return declare(BoundNode, {
		'var': null,
		domTextNode: null,

		// TODO: Support safe attribute

		_bind: function (view) {
			var dataNode = this;

			this._applyBindingExpression(this.var, view, function (value) {
				var existingDomTextNode = dataNode.domTextNode,
					newDomTextNode = dataNode.domTextNode = document.createTextNode(value);

				if (existingDomTextNode) {
					existingDomTextNode.parentNode.replaceChild(newDomTextNode, existingDomTextNode);
				}
				else {
					var endMarker = dataNode.endMarker;
					endMarker.parentNode.insertBefore(newDomTextNode, endMarker);
				}
			});
		}
	});
});
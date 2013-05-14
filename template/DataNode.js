define([
	'dojo/_base/declare',
	'./BoundNode',
	'dbind/bind'
], function (declare, BoundNode, bind) {
	return declare(BoundNode, {
		'var': null,
		domTextNode: null,

		_bind: function (view) {
			var dataNode = this;
			bind(view.viewModel).get(this.var).then(function (value) {
				var existingDomTextNode = dataNode.domTextNode;
				if (existingDomTextNode) {

					existingDomTextNode.parentNode.removeChild(existingDomTextNode);
				}

				var domTextNode = dataNode.domTextNode = document.createTextNode(value),
					endMarker = dataNode.endMarker;
				endMarker.parentNode.insertBefore(domTextNode, endMarker);
			});
		}
	});
});
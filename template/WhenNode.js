define([
	'dojo/_base/declare',
	'./BoundNode'
], function (declare, BoundNode) {
	return declare(BoundNode, {

		resolvedBlock: null,
		errorBlock: null,
		progressBlock: null,

		_bind: function () {
			// TODO: data bind and update content in response to changes.
		}
	});
});
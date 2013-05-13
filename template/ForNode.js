define([
	'dojo/_base/declare',
	'./BoundNode'
], function (declare, BoundNode) {
	return declare(BoundNode, {

		each: null,
		'var': null,

		_create: function () {
			// TODO: data bind and update content in response to changes.
		}
	});
});
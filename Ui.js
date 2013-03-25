define([
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'./_ExpressionTemplatedMixin'
], function (declare, _WidgetBase, _ExpressionTemplatedMixin) {
	return declare([ _WidgetBase, _ExpressionTemplatedMixin ], {
		app: null,

		createUrl: function (path, params) {
			return this.get('app').createUrl(path, params);
		}
	});
});
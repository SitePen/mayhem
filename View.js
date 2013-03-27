define([
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'./_ExpressionTemplatedMixin'
], function (declare, _WidgetBase, _ExpressionTemplatedMixin) {
	return declare([ _WidgetBase, _ExpressionTemplatedMixin ], {
		controller: null,

		postMixInProperties: function () {
			this.inherited(arguments);
			if (!this.templateString) {
				this.templateString = '<div>No template declared for ' + this.declaredClass + '</div>';
			}
		}
	});
});
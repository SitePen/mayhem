define([
	"dojox/mobile/_ItemBase"
], function (_ItemBase) {
	var oldMakeTransition = _ItemBase.prototype.makeTransition;
	_ItemBase.extend({
		makeTransition: function () {
			//	summary:
			//		Disables transitions when the href property is used instead
			//		of moveTo so transitions can be handled intelligently by the
			//		main application router instead.
			if (this.href && !this.hrefTarget) {
				window.location.href = this.href;
				return;
			}

			oldMakeTransition.apply(this, arguments);
		}
	});
});

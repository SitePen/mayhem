define([
	"dojox/mobile/View"
], function (View) {
	var oldPostMixInProperties = View.prototype.postMixInProperties;
	View.extend({
		postMixInProperties: function () {
			//	summary:
			//		Allows baseClass to be overridden in child classes without
			//		breaking dojox/mobile functionality.

			oldPostMixInProperties.apply(this, arguments);

			// dojox/mobile relies on the mblView class existing on all View classes
			if (!/\bmblView\b/.test(this.baseClass)) {
				this.baseClass += " mblView";
			}
		}
	});
});

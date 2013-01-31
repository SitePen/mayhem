define([
	"dojox/mobile/View",
	"dijit/registry"
], function (View, registry) {
	var oldPerformTransition = View.prototype.performTransition;
	View.extend({
		performTransition: function () {
			//	summary:
			//		Prevents meddling with the padding of the container node
			//		which just breaks layout.

			oldPerformTransition.apply(this, arguments);
			var toWidget = registry.byNode(this.toNode);
			if (toWidget) {
				toWidget.containerNode.style.paddingTop = "";
			}
		}
	});
});
define([ "dojox/mobile/Heading" ], function (Heading) {
	var oldSetBackAttr = Heading.prototype._setBackAttr;
	Heading.extend({
		_setBackAttr: function (value) {
			//	summary:
			//		Prevents the display of a back button if no label is provided.

			if (this.backButton) {
				this.backButton.domNode.style.display = value ? "" : "none";
			}
			else if (!value) {
				return;
			}

			oldSetBackAttr.apply(this, arguments);
		}
	});
});
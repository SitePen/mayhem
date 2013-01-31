define([ "dojox/mobile/Heading" ], function (Heading) {
	var oldSetBusyAttr = Heading.prototype._setBusyAttr;
	Heading.extend({
		_setBusyAttr: function (value) {
			//	summary:
			//		Fixes a crash caused by the fix in #7381.

			if (!value && !this._prog) {
				return;
			}

			oldSetBusyAttr.apply(this, arguments);
		}
	});
});
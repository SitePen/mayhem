define([ "dojox/mobile/ListItem" ], function (ListItem) {
	var oldSetBusyAttr = ListItem.prototype._setBusyAttr;
	ListItem.extend({
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
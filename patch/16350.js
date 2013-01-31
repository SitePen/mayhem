define([
	"dojox/mobile/CheckBox"
], function (CheckBox) {
	CheckBox.extend({
		_setValueAttr: function(/*string|boolean*/ newValue, /*boolean*/ priorityChange){
			//	summary:
			//		Ensures that the correct checked value is set.

			if (typeof newValue === "string") {
				this.inherited(arguments);
				newValue = true;
			}

			if (this._created) {
				this.set("checked", newValue, priorityChange);
			}
		}
	});
});
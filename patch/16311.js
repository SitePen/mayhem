define([ "dojox/mobile/TextBox" ], function (TextBox) {
	TextBox.extend({
		_onInput: function(){
			//	summary:
			//		Fixes intermediateChanges not working with dojox/mobile/TextBox.

			this.inherited(arguments);
			if(this.intermediateChanges){ // _TextBoxMixin uses onInput
				// allow the key to post to the widget input box
				this.defer(function(){ this._handleOnChange(this.get("value"), false); });
			}
		}
	});
});

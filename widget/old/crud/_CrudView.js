define([
	"dojo/_base/declare",
	"dojox/mobile/Heading",
	"../../util",
	"../FlexibleView",
	"../_Templated"
], function (declare, Heading, util, FlexibleView, _Templated) {
	return declare([ FlexibleView, _Templated ], {
		//	controller: framework/crud/_CrudContainer
		//		The parent controller for this view.
		controller: null,

		//	backHref: string
		//		The URL to go to when the back button is tapped.
		backHref: "#/home",

		_setBackHrefAttr: function (value) {
			if (this._titleHeading) {
				this._titleHeading.set("href", value);
			}
			this._set("backHref", value);
		}
	});
});

define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_Container",
	"./_Templated"
], function (declare, _WidgetBase, _Container, _Templated) {
	return declare([ _WidgetBase, _Container, _Templated ], {
		//	summary:
		//		A templated widget/container base class.
	});
});
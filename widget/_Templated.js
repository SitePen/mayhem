define([
	"dojo/_base/declare",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin"
], function (declare, _TemplatedMixin, _WidgetsInTemplateMixin) {
	return declare([ _TemplatedMixin, _WidgetsInTemplateMixin ], {
		//	summary:
		//		Convenience module equivalent to the deprecated
		//		`dijit/_Templated` module but without the extra code defined
		//		therein.
	});
});
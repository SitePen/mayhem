define([
	'dojo/_base/declare',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'./utilities/createTemplateFunction'
], function (declare, _TemplatedMixin, _WidgetsInTemplateMixin, createTemplateFunction) {
	return declare([ _TemplatedMixin, _WidgetsInTemplateMixin ], {
		_skipNodeCache: true, // Always rebuild template from string

		_stringRepl: function (template) {
			// summary:
			//		Substitutes the default templating engine with a more advanced
			//		"modified Underscore" templating.

			return createTemplateFunction(template).call(this);
		}
	});
});
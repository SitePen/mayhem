define([
	'dojo/_base/declare',
	'../FormWidgetProxy',
	'dijit/form/SimpleTextarea',
	'dojo/dom-class'
], function (declare, FormWidgetProxy, DijitSimpleTextarea, domClass) {
	return declare(FormWidgetProxy, {
		WidgetToProxy: DijitSimpleTextarea,

		_create: function () {
			this.inherited(arguments);
			domClass.add(this.domNode, 'textareaWidget');
		}
	});
});
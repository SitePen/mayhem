define([
	'dojo/_base/declare',
	'../FormWidgetProxy',
	'dijit/form/SimpleTextArea',
	'dojo/dom-class'
], function (declare, FormWidgetProxy, DijitSimpleTextArea, domClass) {
	return declare(FormWidgetProxy, {
		WidgetToProxy: DijitSimpleTextArea,

		_create: function () {
			this.inherited(arguments);
			domClass.add(this.domNode, 'textAreaWidget');
		}
	});
});
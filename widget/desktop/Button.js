define([
	'dojo/_base/declare',
	'../FormWidgetProxy',
	'dijit/form/Button',
	'dojo/dom-class'
], function (declare, FormWidgetProxy, DijitButton, domClass) {
	return declare(FormWidgetProxy, {
		WidgetToProxy: DijitButton,

		_labelGetter: FormWidgetProxy.createProxiedGetter('label'),
		_labelSetter: FormWidgetProxy.createProxiedSetter('label'),

		_create: function () {
			this.inherited(arguments);
			domClass.add(this.domNode, 'buttonWidget');
		}
	});
});

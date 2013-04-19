define([
	'dojo/_base/declare',
	'../FormWidgetProxy',
	'dijit/form/CheckBox',
	'dojo/dom-class'
], function (declare, FormWidgetProxy, RadioButton, domClass) {
	return declare(FormWidgetProxy, {
		WidgetToProxy: RadioButton,

		_create: function () {
			this.inherited(arguments);
			domClass.add(this.domNode, 'checkBoxWidget');
		},

		_checkedGetter: function () {
			this._proxiedWidget.get('checked');
		},
		_checkedSetter: function (checked) {
			this._proxiedWidget.set('checked', checked);
		}
	});
});
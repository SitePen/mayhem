define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/_base/array',
	'../FormWidgetProxy',
	'dijit/form/Select',
	'dojo/dom-class'
], function (declare, lang, array, FormWidgetProxy, DijitSelect, domClass) {
	return declare(FormWidgetProxy, {
		WidgetToProxy: DijitSelect,

		itemLabelProperty: null,
		itemValueProperty: null,

		_itemsSetter: function (items) {
			var labelProperty = this.itemLabelProperty,
				valueProperty = this.itemValueProperty || labelProperty;
			var options = array.map(items, lang.hitch(this, function (item) {
				return {
					label: labelProperty ? item[labelProperty] : item.toString(),
					value: valueProperty ? item[valueProperty] : item.toString()
				};
			}));
			this._proxiedWidget.set('options', options);
			this._proxiedWidget.validate();
		},

		_create: function () {
			this.inherited(arguments);
			domClass.add(this.domNode, 'selectWidget');
		}
	});
});
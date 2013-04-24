define([
	'dojo/_base/declare',
	'../FormWidgetProxy',
	'dijit/form/FilteringSelect',
	'dojo/dom-class'
], function (declare, FormWidgetProxy, FilteringSelect, domClass) {
	return declare(FormWidgetProxy, {
		WidgetToProxy: FilteringSelect,

		// itemLabelProperty: String
		//		The name of the item property to use for menu item labels.

		_itemLabelPropertyGetter: function () {
			return this._proxiedWidget.get('labelAttr');
		},
		_itemLabelPropertySetter: function (value) {
			this._proxiedWidget.set('labelAttr', value);
		},

		// itemFilterProperty: String
		//		The name of the item property to use for filtering menu items.

		_itemFilterPropertyGetter: function () {
			return this._proxiedWidget.get('searchAttr');
		},
		_itemFilterPropertySetter: function (value) {
			this._proxiedWidget.set('searchAttr', value);
		},

		// store: dojo/store/api/Store
		//		The object store used to populate and filter the menu.

		_storeGetter: function () {
			return this._proxiedWidget.get('store');
		},
		_storeSetter: function (value) {
			this._proxiedWidget.set('store', value);
		},

		// query: Object
		//		The base query used to query the store and to filter menu items.

		_queryGetter: function () {
			return this._proxiedWidget.get('query');
		},
		_querySetter: function (value) {
			this._proxiedWidget.set('query', value);
		},

		_create: function () {
			this.inherited(arguments);
			domClass.add(this.domNode, 'filteringSelectWidget');
		}
	});
});
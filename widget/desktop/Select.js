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
		itemIdentifierProperty: null,

		_itemsSetter: function (items) {
			var options = array.map(items, lang.hitch(this, function (item) {
				return {
					label: this._renderItem(item),
					value: item[this.itemIdentifierProperty]
				};
			}));
			this._proxiedWidget.set('options', options);
			this._proxiedWidget.validate();
		},

		_create: function () {
			this.inherited(arguments);
			domClass.add(this.domNode, 'selectWidget');
		},

		_createProxiedWidget: function (propertiesToMixIn, srcNodeRef) {
			propertiesToMixIn = lang.mixin({ options: [] }, propertiesToMixIn);
			this.inherited(arguments, [ propertiesToMixIn, srcNodeRef ]);
		},

		// TODO: Revisit this. It feels wrong for this to be able to return HTML. Supporting returning a widget might be better abstraction.
		_renderItem: function (item) {
			// summary:
			//		Renders an item for the select menu.
			// item: Object|String
			//		The item to render
			// returns: String|DomNode
			//		Returns a string that may contain HTML.
			// tags:
			//		protected

			return item[this.itemLabelProperty];
		}
	});
});
define([
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/_base/declare',
	'./BoundNode'
], function (lang, arrayUtil, declare, BoundNode) {
	return declare(BoundNode, {
		// summary:
		//		Template node that generates content for each item in a collection.

		// ContentTemplate: Function
		//		The constructor for per-item content.
		ContentTemplate: null,

		// each: DataBindingExpression
		//		An expression indicating what collection to bind to
		each: null,

		// valueName: String
		//		The name of the item to use in data binding expressions
		valueName: null,

		// contentItems: Array
		//		An array of content nodes corresponding to the collection items
		contentItems: null,

		_create: function (kwArgs) {
			this.inherited(arguments);
			this.each.bind(kwArgs.bindingContext, lang.hitch(this, '_update', kwArgs));
		},

		_update: function (kwArgs, array) {
			// summary:
			//		Update the content items from the collection items
			// kwArgs:
			//		The data binding args
			// array: Array
			// 		The item array

			if (this.contentItems) {
				arrayUtil.forEach(this.contentItems, function (contentItem) {
					contentItem.destroy();
				});
			}

			// TODO: Support StatefulArray binding
			this.contentItems = arrayUtil.map(array, lang.hitch(this, function (item) {
				var itemData = {};
				itemData[this.valueName] = item;

				// TODO: Fix this. This is a hack to avoid carrying dbind _binding property forward for these specializations.
				itemData._binding = undefined;

				var itemBindingContext = lang.delegate(kwArgs.bindingContext, itemData),
					// TODO: Fix naming to be more consistent: ContentNode
					contentItem = new this.ContentTemplate(lang.delegate(kwArgs, {
						bindingContext: itemBindingContext
					}));
				window.bContext = itemBindingContext;
				contentItem.placeAt(this.endMarker, 'before');
				return contentItem;
			}));
		},

		destroy: function () {
			if (this.contentItems) {
				arrayUtil.forEach(this.contentItems, function (contentItem) {
					contentItem.destroy();
				});
				this.contentItems = null;
			}
			this.inherited(arguments);
		}
	});
});
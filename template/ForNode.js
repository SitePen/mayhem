define([
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/_base/declare',
	'./BoundNode'
], function (lang, arrayUtil, declare, BoundNode) {
	return declare(BoundNode, {
		ContentConstructor: null,

		each: null,
		valueName: null,

		contentItems: null,

		_bind: function (kwArgs) {
			this.each.bind(kwArgs.bindingContext, lang.hitch(this, '_update', kwArgs));
		},

		// TODO: The list of necessary params is exploding. Consider if kwArgs or a better design is in order.
		_update: function (kwArgs, array) {
			if (this.contentItems) {
				arrayUtil.forEach(this.contentItems, function (contentItem) {
					contentItem.destroy();
				});
			}

			// TODO: Support StatefulArray binding for updating item-specific content.
			this.contentItems = arrayUtil.map(array, lang.hitch(this, function (item) {
				var itemData = {};
				itemData[this.valueName] = item;

				// TODO: Fix this. This is a hack to avoid carrying dbind _binding property forward for these specializations.
				itemData._binding = undefined;

				var itemBindingContext = lang.delegate(kwArgs.bindingContext, itemData),
					contentItem = new this.ContentConstructor(lang.delegate(kwArgs, {
						bindingContext: itemBindingContext
					}));
				contentItem.placeAt(this.endMarker, 'before');
				return contentItem;
			}));
		}
	});
});
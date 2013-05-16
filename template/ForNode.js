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

		_bind: function (view, options, context) {
			this.each.bind(context, lang.hitch(this, '_update', view, options, context));
		},

		// TODO: The list of necessary params is exploding. Consider if kwArgs or a better design is in order.
		_update: function (view, options, context, array) {
			if (this.contentItems) {
				arrayUtil.forEach(this.contentItems, function (contentItem) {
					contentItem.destroy();
				});
			}

			// TODO: Support StatefullyArray binding for updating item-specific content.
			this.contentItems = arrayUtil.map(array, lang.hitch(this, function (item) {
				var itemData = {};
				itemData[this.valueName] = item;

				var contentItem = new this.ContentConstructor(view, lang.delegate(options, {
					additionalContext: itemData
				}));
				contentItem.placeAt(this.endMarker, 'before');
				return contentItem;
			}));
		}
	});
});
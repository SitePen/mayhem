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

		_bind: function (view) {
			this.each.bind(view, lang.hitch(this, '_update', view));
		},

		_update: function (view, array) {
			if (this.contentItems) {
				arrayUtil.forEach(this.contentItems, function (contentItem) {
					contentItem.destroy();
				});
			}

			// TODO: Support StatefullyArray binding for updating item-specific content.
			this.contentItems = arrayUtil.map(array, lang.hitch(this, function (item) {
				var itemData = {};
				itemData[this.valueName] = item;

				var contentItem = new this.ContentConstructor(lang.delegate(view, itemData));
				contentItem.placeAt(this.endMarker, 'before');
				return contentItem;
			}));
		}
	});
});
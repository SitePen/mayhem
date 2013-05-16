define([
	'dojo/_base/declare',
	'./BoundNode',
	'dojo/_base/lang',
	'dojo/_base/array'
], function (declare, BoundNode, lang, arrayUtil) {
	return declare(BoundNode, {

		name: null,

		_bind: function (kwArgs) {
			this.inherited(arguments);

			var view = kwArgs.view,
				placeholder = this;

			// TODO: What is a better way to bind to a view's subviews?
			// TODO: Stop leaking this handle.
			view.subViews.watch(this.name, function (name, oldValue, newValue) {
				var viewArray = newValue;
				// TODO: Stop leaking this handle.
				viewArray.watchElements(function (index, removedViews, addedViews) {
					arrayUtil.forEach(removedViews, lang.hitch(placeholder, 'removeView'));
					arrayUtil.forEach(addedViews, lang.hitch(placeholder, 'addView'));
				});
			});
		},

		addView: function (view) {
			view.placeAt(this.endMarker, 'before');
		},

		removeView: function (view) {
			view.remove();
		}
	});
});
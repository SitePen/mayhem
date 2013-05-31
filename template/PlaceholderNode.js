define([
	'dojo/_base/declare',
	'./Node',
	'dojo/_base/lang',
	'dojo/_base/array'
], function (declare, Node, lang, arrayUtil) {
	return declare(Node, {
		// summary:
		//		Template node placeholder for sub-views

		// name: [readonly] String
		//		The name of the placeholder
		name: null,

		_create: function (kwArgs) {
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
			// summary:
			//		Add a view to the placeholder.
			// view: framework/View
			//		The view to add
			view.placeAt(this.endMarker, 'before');
		},

		removeView: function (view) {
			// summary:
			//		Remove a view from the placeholder.
			// view: framework/View
			//		The view to remove
			view.remove();
		}
	});
});
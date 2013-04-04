define([
	'dojo/_base/declare',
	'dojo/_base/array',
	'dojo/_base/lang',
	'dijit/_WidgetBase'
], function (declare, array, lang, WidgetBase) {

	var View = declare(WidgetBase, {

		//	viewModel:
		//		The model that this view reflects.  The viewModel is also the context for data binding
		//		in the template
		viewModel: null,

		//	parentView: View
		//		A reference to this view's parent view.
		parentView: null,

		//	subViews: object
		//		A map of views where the key is the name of the placeholder and the value is an
		//		ordered list of views that have been added to that placeholder.  The "default" key
		//		is reserved for a single unnamed placeholder.  If a placeholder is named "default"
		//		then there can be no unnamed placeholder.
		subViews: null,

		//	template: framework/Template
		//		A Template for rendering this view

		buildRendering: function () {
			// TODO: need to pass in bound objects for the viewModel and subViews
			// get a domNode from the compiled template.  the template should manage the DOM based
			// on mutations to the underlying data.
			if (this.template) {
				// the template will automatically set('domNode', node) when it can and will
				/// potentially replace the domNode in response to changes in viewModel
				this.template.render(this);
			}

			// TODO:
			//	* attach points and attach events (maybe dijit/_AttachMixin)
			//	* widget parsing (maybe parse each block in the template after it renders)
			//
			// these might make the most sense to do them in the compiled template where it has
			// the knowledge of the individual blocks that might need to be re-rendered based on
			// changes in data.
			this.inherited(arguments);
		},

		_setDomNodeAttr: function (node) {
			var domNode = this.domNode;

			if (domNode && domNode.parentNode) {
				domNode.parentNode.replaceChild(node, domNode);
			}

			this._set('domNode', node);
		},

		// TODO: do we still need removeSubView as a public API since this returns a handle?
		addSubView: function (view, destination) {
			//	summary:
			//		Adds a subview to this view
			//	view: View
			//		The view to be added
			//	destination: string?
			//		The name of the target placeholder for the view being added.  If no destination
			//		is specified, 'default' will be the destination.  The default implementation
			//		allows multiple subViews to be added to the same placeholder.
			//	returns: object
			//		A handle to remove the subView

			destination = destination || 'default';

			// TODO: make subViews and the placeholder lists something that can be observed.  then
			// the template can observe the placeholder lists and incrementally update the rendering
			var subViews = this.subViews || (this.subViews = {}),
				placeholder = subViews[destination] || (subViews[destination] = []);

			placeholder.push(view);

			return {
				remove: lang.hitch(this, 'removeSubView', view, destination)
			};
		},

		// TODO: can we remove this as part of the public API since addSubView returns a handle?
		removeSubView: function (view, location) {
			//	summary:
			//		Removes a subView.
			//	view: View
			//		The view to be removed
			//	location: string?
			//		The name of the placeholder that is holding this view.  If it's not provided,
			//		all the placeholders will be iterated.

			var subViews = this.subViews,
				placeholder,
				name,
				index;

			if (!subViews) {
				return;
			}

			for (name in subViews) {
				// if location was provided, we're going to hijack the first pass through this
				// iteration and then return without allowing the iterating to continue.
				placeholder = subViews[location || name];
				index = array.indexOf(placeholder, view);
				if (index > -1) {
					placeholder.splice(index, 1);
					return;
				}
				if (location) {
					return;
				}
			}
		}
	});

	return View;
});

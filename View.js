define([
	'dojo/_base/declare',
	'dojo/_base/array',
	'dojo/_base/lang',
	'dbind/bind',
	'dojo/Stateful',
	'./StatefulArray',
	'./Component'
], function (declare, array, lang, bind, Stateful, StatefulArray, Component) {

	var View = declare(Component, {

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

		//  TemplateConstructor:
		//		A constructor for the view template.
		TemplateConstructor: null,

		//	template: framework/Template
		//		The view template

		// TODO: add a setter for template that tears down any existing template and renders the new one

		//	nodes: Element[]
		//		An array of nodes representing the top level of the hierarchy of DOM nodes
		//		controlled by this View.

		constructor: function () {
			this.subViews = new Stateful();
		},

		postscript: function () {
			this.inherited(arguments);

			this.template = new this.TemplateConstructor({ view: this });
		},

		placeAt: function (node, position) {
			// TODO: this currently only supports our nodes being placed as child nodes of the
			// provided node.  besides the placeholder renderer, this is also the only way to
			// trigger rendering of a view.  in practice, this whole method only matters for the top
			// view since everything is connected as sub-views after that.

			this.template.placeAt(node, position);

			return this;
		},

		remove: function () {
			this.template.remove();
			this.template = null;
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

			// TODO: make subViews and the placeholder lists something that can be observed.  then
			// the template can observe the placeholder lists and incrementally update the rendering
			var subViewArray = this._lookupSubviewArray(destination);
			subViewArray.push(view);

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
		},

		startup: function () {
			// TODO: for now, placeAt is all we need so this method is just stubbed out
			console.warn('View#startup is not be needed. currently it does... nothing');
		},

		// TODO: work this into the View lifecycle now that we've removed _WidgetBase
		destroyRendering: function () {
			if (this.template) {
				this.template.unrender(this);
			}

			this.inherited(arguments);
		},

		_lookupSubviewArray: function (location) {
			location = location || 'default';

			var subViews = this.subViews,
				subView = subViews.get(location);
			if (!subView) {
				subView = new StatefulArray();
				subViews.set(location, subView);
			}

			return subView;
		}
	});

	return View;
});

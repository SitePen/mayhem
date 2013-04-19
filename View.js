define([
	'dojo/_base/declare',
	'dojo/_base/array',
	'dojo/_base/lang',
	'dbind/bind',
	'./Component'
], function (declare, array, lang, bind, Component) {

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

		//	template: framework/Template
		//		A Template for rendering this view

		// TODO: add a setter for template that tears down any existing template and renders the new one

		//	nodes: Element[]
		//		An array of nodes representing the top level of the hierarchy of DOM nodes
		//		controlled by this View.

		render: function () {
			//	summary:
			//		Renders this View based on it's template.  As a result of this, the nodes
			//		property will be set.

			var view = this;

			if (this.template) {
				// render the template to get back the list of nodes
				bind.when(this.template.render(this), function (nodes) {
					var currentNodes = view.nodes || [],
						firstNode = currentNodes[0],
						lastNode = currentNodes[currentNodes.length - 1],
						// we will move the parentNode to a document fragment
						parentNode = firstNode && firstNode.parentNode,
						// we need to know where to put the parentNode back
						parentSibling = parentNode && parentNode.nextSibling,
						parentParent = parentNode && parentNode.parentNode,
						parentFrag,
						i = 0,
						length = nodes.length;

					// if the view already has a firstNode.parentNode then we need to remove all the
					// nodes.
					if (parentNode && firstNode !== nodes[0]) {
						// move parentNode to a document fragment first since we will add/remove
						// multiple nodes most likely
						parentFrag = document.createDocumentFragment();
						parentFrag.appendChild(parentNode);

						// remove the previous nodes but leave the firstNode there as a point of
						// reference for insertBefore when adding the new nodes
						while (firstNode !== lastNode) {
							lastNode = lastNode.previousSibling;
							parentNode.removeChild(lastNode.nextSibling);
						}

						// add the new nodes
						while (i < length) {
							parentNode.insertBefore(nodes[i++], firstNode);
						}

						// we're done with the firstNode now, so remove it
						parentNode.removeChild(firstNode);

						if (parentParent) {
							// we can put the parentNode back in the document now
							parentParent.insertBefore(parentNode, parentSibling);
						}
					}

					// now that everything is in place we'll set the new values for nodes
					view.set('nodes', nodes);
				});
			}
		},

		placeAt: function (node) {
			// TODO: this currently only supports our nodes being placed as child nodes of the
			// provided node.  besides the placeholder renderer, this is also the only way to
			// trigger rendering of a view.  in practice, this whole method only matters for the top
			// view since everything is connected as sub-views after that.
			this.render();

			var nodes = this.nodes || [],
				i = 0,
				length = nodes.length;

			while (i < length) {
				node.appendChild(nodes[i++]);
			}

			return this;
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

			// XXX: an ugly hack to work around the lack of observable array mutations
			// and also https://github.com/kriszyp/dbind/issues/11
			this.render();

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
			this.nodes = null;

			this.inherited(arguments);
		}
	});

	return View;
});

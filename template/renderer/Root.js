define([
	'dojo/_base/array',
	'dbind/bind',
	'./Renderers'
], function (array, bind, Renderers) {

	function RootRender(astRoot) {
		//	summary:
		//		A renderer for the root of an AST.  It is intended that an instance of this should
		//		be mixed into Template.
		//	astRoot: object
		//		The root node of a template's AST.  At a minimum, it should have the following
		//		properties:
		//		* program (array): An array of AST nodes

		var program = astRoot.program,
			statements = program.statements,
			url = astRoot.sourceUrl || 'unknown location';

		// TODO: find the deps and pass them along...
		//this.deps = this.deps || [];

		// if this program controls more than a single DOM node then we currently have an error
		// because dijit/_Widget needs a single domNode
		if (statements.length > 1) {
			throw new Error('Attempt to render more than one DOM Element at "' + url + '"');
		}

		this.root = new Renderers[program.type](program);
	}

	RootRender.prototype = {
		constructor: RootRender,

		render: function (view) {
			//	summary:
			//		Binds to the viewModel property of the view and renders a template using the
			//		viewModel as the context.
			//	view: framework/View

			var template = this;

			// TODO: StatefulPropertyBinding#get doesn't work so we need to do this rather than
			// this.subViews = bind(view).get('subViews');
			this.subViews = bind(view.get('subViews'));

			// use a bound context so that if the viewModel property of the view changes, we react
			bind(view, 'viewModel').receive(function (context) {
				var root = template.root,
					node = view.domNode;

				// if we are re-rendering then we should clean up the previous rendering
				root.unrender(node);

				// let the view know circumstances have changed. hopefully no bled has been shed
				bind(root.render(context, template)).receive(function (nodes) {
					if (nodes.length > 1) {
						console.warn('uh-oh... too many DOM nodes', nodes);
					}
					view.set('domNode', nodes[0]);
				});
			});
		},

		unrender: function (view) {
			//	summary:
			//		Unrendering should tear down a specific rendering of a view
			//	view: framework/View

			this.root.unrender(view.domNode);
		},

		destroy: function () {
			//	summary:
			//		Destroying a template will destroy the logic that is capable of producing a
			//		rendering.  It does not directly affect any renderings of the template.

			// TODO:
		}
	};

	return RootRender;
});
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
			url = astRoot.sourceUrl || 'unkown location',
			root = program[0];

		if (program.length > 1) {
			// TODO: we could possibly return a document fragment if there was more than one
			// top-level node but for now we'll say we don't support it.
			throw new Error('More than one top-level node specified in "' + url + '"');
		}

		console.log('creating RootRender for', astRoot);

		this.root = new Renderers[root.type](root);
	}

	RootRender.prototype = {
		constructor: RootRender,

		render: function (view) {
			//	summary:
			//		Binds to the viewModel property of the view and renders a template using the
			//		viewModel as the context.
			//	view: framework/View

			var template = this;

			// use a bound context so that if the viewModel property of the view changes, we react
			bind(view).get('viewModel').receive(function (context) {
				var root = template.root,
					node = view.domNode;

				// if we are re-rendering then we should clean up the previous rendering
				root.unrender(node);

				// let the view know circumstances have changed. hopefully no bled has been shed
				view.set('domNode', root.render(context, template));
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
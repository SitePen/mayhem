define([
	'dojo/_base/array',
	'dbind/bind',
	'./Renderers'
], function (array, bind, Renderers) {

	function RootRenderer(astRoot) {
		//	summary:
		//		A renderer for the root of an AST.  It is intended that an instance of this should
		//		be mixed into Template.
		//	astRoot: object
		//		The root node of a template's AST.  At a minimum, it should have the following
		//		properties:
		//		* program (array): An array of AST nodes

		var program = astRoot.program;

		this.deps = program.deps;

		this.root = new Renderers[program.type](program);
	}

	RootRenderer.prototype = {
		constructor: RootRenderer,

		render: function (view) {
			//	summary:
			//		Binds to the viewModel property of the view and renders a template using the
			//		viewModel as the context.
			//	view: framework/View

			var template = this;

			// use a bound context so that if the viewModel property of the view changes, we react
			return bind(function (context) {
				var root = template.root;

				// if we are re-rendering then we should clean up the previous rendering
				root.unrender(view.domNode);

				// return the rendering as the transformed value
				return root.render(view, context, template);
			}).to(view, 'viewModel');
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

	return RootRenderer;
});
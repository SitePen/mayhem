define([
	'./Renderers',
	'dbind/bind',
], function (Renderers, bind) {

	function PlaceholderRenderer(program) {
		//	summary:
		//		Manages the rendering and updating of a Placeholder
		//	program:
		//		The AST node that describes this Block

		this.name = program.name;
	}

	PlaceholderRenderer.prototype = {
		constructor: PlaceholderRenderer,

		render: function (view, context, template) {
			//	summary:
			//		TODOC:
			//	view:
			//		The view being rendered
			//	context:
			//		The context for resolving references to variables
			//	template: framework/Template
			//	returns:
			//		TODOC:

			return bind(function () {
				var subViews = [].slice.call(arguments),
					output = [],
					subView;

				while (subViews.length) {
					subView = subViews.shift();
					if (subView && subView.domNode) {
						output.push(subView.domNode);
					}
				}

				return output;
			}).to(template.subViews.get(this.name));
		},

		unrender: function (node) {
			// TODO:
		},

		destroy: function () {
			// TODO:
		}
	};

	return PlaceholderRenderer;
});
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

		render: function (view) {
			//	summary:
			//		TODOC:
			//	view:
			//		The view being rendered
			//	returns: Element[]
			//		An array of DOM nodes.

			var subViews = view.subViews || {};
			return bind.when(subViews[this.name], function (subViews) {
				var output = [],
					nodes,
					subView,
					i = 0;

				while (subViews && (subView = subViews[i++])) {
					subView.render();
					nodes = subView.nodes || [];
					output = output.concat(nodes);
				}

				return output;
			});
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
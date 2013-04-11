define([
	'./Renderers',
	'dbind/bind',
	'dojo/_base/array'
], function (Renderers, bind, array) {

	function PlaceholderRender(program) {
		//	summary:
		//		Manages the rendering and updating of a Placeholder
		//	astNode:
		//		The AST node that describes this Block

		this.name = program.name;
	}

	PlaceholderRender.prototype = {
		constructor: PlaceholderRender,

		render: function (context, template) {
			//	summary:
			//		TODOC
			//	context:
			//		The context for resolving references to variables
			//	template: framework/Template
			//	returns: DOMElement

			return bind(function () {
				return array.map([].slice.call(arguments), function (subView) {
					return subView.domNode;
				});
			}).to(template.subViews.get(this.name));
		},

		unrender: function (node) {
			// TODO:
		},

		destroy: function () {
			// TODO:
		}
	};

	return PlaceholderRender;
});
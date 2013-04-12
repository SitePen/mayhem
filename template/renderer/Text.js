define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function TextRenderer(astNode) {
		//	summary:
		//		Manages the rendering of an AST node that was parsed as a Text Node.
		//	astNode:
		//		The AST node describing this Text Node.

		this.program = new Renderers.Program(astNode.program);
	}

	TextRenderer.prototype = {
		constructor: TextRenderer,

		render: function (view, context, template) {
			//	summary:
			//		Renders the program of this AST node and returns the DOM representation of that
			//		text.
			//	returns:
			//		Document fragment, unless it's a single node in which case it returns the node
			//		itself.

			var program = this.program;

			return bind(function () {
				return template.toDom([].join.call(arguments, ''));
			}).to(program.render.apply(program, arguments));
		},

		unrender: function () {

		},

		destroy: function () {

		}
	};

	return TextRenderer;
});
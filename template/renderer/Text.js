define([
	'./Renderers',
	'dbind/bind',
	'dojo/dom-construct'
], function (Renderers, bind, domConstruct) {

	function TextRenderer(astNode) {
		//	summary:
		//		Manages the rendering of an AST node that was parsed as a Text Node.
		//	astNode:
		//		The AST node describing this Text Node.

		this.program = new Renderers.Program(astNode.program);
	}

	TextRenderer.prototype = {
		constructor: TextRenderer,

		render: function () {
			//	summary:
			//		Renders the program of this AST node and returns the DOM representation of that
			//		text.
			//	returns:
			//		Document fragment, unless it's a single node in which case it returns the node
			//		itself.

			var program = this.program;

			return bind.when(program.render.apply(program, arguments), function (statements) {
				return domConstruct.toDom(statements.join(''));
			});
		},

		unrender: function () {

		},

		destroy: function () {

		}
	};

	return TextRenderer;
});
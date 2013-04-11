define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function TextRender(astNode) {
		//	summary:
		//		Manages the rendering of an AST node that was parsed as a Text Node.
		//	astNode:
		//		The AST node describing this Text Node.

		this.program = new Renderers.Program(astNode.program.statements);
	}

	TextRender.prototype = {
		constructor: TextRender,

		render: function (context, template) {
			//	summary:
			//		Renders the program of this AST node and returns the DOM representation of that
			//		text.
			//	returns:
			//		Document fragment, unless it's a single node in which case it returns the node
			//		itself.

			return bind(function () {
				return template.toDom([].join.call(arguments, ''));
			}).to(this.program.render(context, template));
		},

		unrender: function () {

		},

		destroy: function () {

		}
	};

	return TextRender;
});
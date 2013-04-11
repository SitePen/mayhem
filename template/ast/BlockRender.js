define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function BlockRender(block) {
		//	summary:
		//		Manages the rendering and updating of a BlockNode
		//	astNode:
		//		The AST program that describes this Block

		this.isInverse = block.isInverse;

		var inverse = block.inverse;
		this.program = new Renderers.Program(block.program);

		if (inverse) {
			this.inverse = new Renderers.Program(inverse);
		}
	}

	BlockRender.prototype = {
		constructor: BlockRender,

		render: function () {
			//	summary:
			//		TODOC
			//	context:
			//		The context for resolving references to variables
			//	template: framework/Template
			//	returns: DOMElement
			var program = this.isInverse ? this.inverse : this.program;

			return program.render.apply(program, arguments);
		},

		unrender: function (node) {
			// TODO:
		},

		destroy: function () {
			// TODO:
		}
	};

	return BlockRender;
});
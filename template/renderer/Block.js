define([
	'./Renderers'
], function (Renderers) {

	function BlockRenderer(block) {
		//	summary:
		//		Manages the rendering and updating of a BlockNode
		//	block:
		//		The AST node that describes this Block

		this.isInverse = block.isInverse;

		var inverse = block.inverse;
		this.program = new Renderers.Program(block.program);

		if (inverse) {
			this.inverse = new Renderers.Program(inverse);
		}
	}

	BlockRenderer.prototype = {
		constructor: BlockRenderer,

		render: function () {
			//	summary:
			//		TODOC:

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

	return BlockRenderer;
});
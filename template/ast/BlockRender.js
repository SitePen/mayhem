define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function BlockRender(program) {
		//	summary:
		//		Manages the rendering and updating of a BlockNode
		//	program:
		//		The AST program that describes this Block

		var programPlaceholders = program.placeholders,
			placeholders = {},
			node,
			k;

		for (k in programPlaceholders) {
			node = programPlaceholders[k];
			placeholders[k] = new Renderers[node.type](node);
		}

		this.content = new Renderers.Program(program.content);
		this.blocks = new Renderers.Program(program.blocks);
		this.placeholders = placeholders;
	}

	BlockRender.prototype = {
		constructor: BlockRender,

		render: function (context, template) {
			//	summary:
			//		TODOC
			//	context:
			//		The context for resolving references to variables
			//	template: framework/Template
			//	returns: DOMElement

			console.log('BlockRender#render');

			// TODO: render the blocks and placeholders
			return this.content.render(context, template);
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
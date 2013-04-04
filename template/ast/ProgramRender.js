define([
	'./Renderers'
], function (Renderers) {

	function ProgramRender(program) {
		var i = 0,
			Renderer,
			node,
			blocks = this.blocks = [];

		while ((node = program[i++])) {
			Renderer = Renderers[node.type];
			if (Renderer) {
				blocks.push(new Renderer(node));
			}
			else {
				console.warn('no renderer for', node.type, node);
			}
		}
	}

	ProgramRender.prototype = {
		constructor: ProgramRender,

		render: function () {
			var blocks = this.blocks || [],
				output = [],
				i = 0,
				block;

			while ((block = blocks[i++])) {
				output.push(block.render.apply(block, arguments));
			}

			return output;
		},

		unrender: function () {

		},

		destroy: function () {

		}
	};

	return ProgramRender;
});
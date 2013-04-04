define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function TextRender(astNode) {
		this.program = new Renderers.Program(astNode.program);
	}

	TextRender.prototype = {
		constructor: TextRender,

		render: function (context, template) {
			return bind(function () {
					return document.createTextNode([].join.call(arguments, ''));
				}).to(this.program.render(context, template));
		},

		unrender: function () {

		},

		destroy: function () {

		}
	};

	return TextRender;
});
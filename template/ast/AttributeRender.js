define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function AttributeRender(astNode) {
		// TODO: process astNode
		this.nodeName = astNode.nodeName;
		this.program = new Renderers.Program(astNode.program);
	}

	AttributeRender.prototype = {
		constructor: AttributeRender,

		render: function (context, template, node) {
			var attribute = this.nodeName;

			return bind(function () {
				return [].join.call(arguments, '');
			}).to(this.program.render(context, template)).receive(function (value) {
				node.setAttribute(attribute, value);
			});
		},

		unrender: function () {
			// ...
		},

		destroy: function () {
			// ...
		}
	};

	return AttributeRender;
});
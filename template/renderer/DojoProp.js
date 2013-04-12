define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function DojoPropRenderer(astNode) {
		//	summary:
		//		Manages the rendering and updating of a dojo property
		//	astNode:
		//		The AST Node that describes this dojo property

		this.name = astNode.name;
		this.program = new Renderers.Program(astNode.program);
	}

	DojoPropRenderer.prototype = {
		constructor: DojoPropRenderer,

		render: function () {
			//	summary:
			//		Resolves the value for a dojo property
			//	returns:
			//		An object with the following properties
			//		* name: the name of the property
			//		* value: the value of the property

			var name = this.name,
				program = this.program;

			return bind(function (value) {
				return {
					name: name,
					value: value
				};
			}).to(program.render.apply(program, arguments));
		},

		unrender: function () {
			// ...
		},

		destroy: function () {
			// ...
		}
	};

	return DojoPropRenderer;
});
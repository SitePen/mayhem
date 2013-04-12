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

		render: function (context, template) {
			//	summary:
			//		Resolves the value for a dojo property
			//	context:
			//		The context used to resolve logic
			//	template: framework/Template
			//	returns:
			//		An object with the following properties
			//		* name: the name of the property
			//		* value: the value of the property

			var name = this.name;

			return bind(function (value) {
				return {
					name: name,
					value: value
				};
			}).to(this.program.render(context, template));
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
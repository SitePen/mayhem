define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function AttributeRenderer(astNode) {
		//	summary:
		//		Manages the rendering and updating of an Element's attribute
		//	astNode:
		//		The AST Node that describes this attribute

		this.nodeName = astNode.nodeName;
		this.program = new Renderers.Program(astNode.program);
	}

	AttributeRenderer.prototype = {
		constructor: AttributeRenderer,

		render: function () {
			//	summary:
			//		Sets or removes an attribute on an Element.
			//	view:
			//		The view being rendered
			//	context:
			//		The context used to resolve logic
			//	template: framework/Template
			//	element: DOMElement
			//		The DOM Element this attribute is associated with.
			//	returns: object
			//		An object with the following properties:
			//		* name (string): The name of the attribute
			//		* value (string): The value of the attribute

			var attribute = this.nodeName,
				program = this.program;

			return bind.when(program.render.apply(program, arguments), function (values) {
				// values are joined together as a string to form a single value
				var value = values.join('');

				// TODO: this coercion isn't right.
				value = value === 'true' ? '' : value === 'false' ? false : value;

				return {
					name: attribute,
					value: value
				};
			});
		},

		unrender: function () {
			// ...
		},

		destroy: function () {
			// ...
		}
	};

	return AttributeRenderer;
});
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

		render: function (view, context, template, element) {
			//	summary:
			//		Sets or removes an attribute on an Element.
			//	view:
			//		The view being rendered
			//	context:
			//		The context used to resolve logic
			//	template: framework/Template
			//	element: DOMElement
			//		The DOM Element this attribute is associated with.
			//	returns: array
			//		The output of rendering the program of this node.

			var attribute = this.nodeName,
				program = this.program,
				values = program.render.apply(program, arguments);

			bind(values).receive(function (values) {
				// if there's just one thing, treat it as the value.  this gives us the chance
				// to have a false value and remove an attribute based on that.
				// if there's more than one thing, they are joined together as a string to form
				// a single value
				var value = values.join('');

				// TODO: this coercion probably isn't working right.
				// coerce representations of true to an empty string and false to be false
				value = value === 'true' ? '' : value === 'false' ? false : value;

				// some attributes need to be removed rather than set to an empty string
				if (value === false) {
					element.removeAttribute(attribute);
				}
				else {
					element.setAttribute(attribute, value);
				}

				return value;
			});

			return values;
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
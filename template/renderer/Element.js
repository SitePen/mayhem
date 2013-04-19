define([
	'./Renderers',
	'dbind/bind',
	'dojo/dom-construct'
], function (Renderers, bind, domConstruct) {

	function ElementRenderer(astNode) {
		//	summary:
		//		Manages the rendering and updating of a DOM Element
		//	astNode:
		//		The AST node that describes this Element

		this.nodeName = astNode.nodeName;

		this.statements = new Renderers.Statements(astNode.statements);
		this.attributes = new Renderers.Statements(astNode.attributes);
	}

	ElementRenderer.prototype = {
		constructor: ElementRenderer,

		render: function () {
			//	summary:
			//		Generates a DOM element and renders the attributes and childNodes.
			//	returns: DOMElement

			// TODO: cloneNode
			var element = this.element || (this.element = domConstruct.create(this.nodeName)),
				statements = this.statements,
				attributes = this.attributes;

			return bind.when(statements.render.apply(statements, arguments), function (childNodes) {
				var i = 0,
					length = childNodes.length;

				// render the attributes
				bind.when(attributes.render.apply(attributes, arguments), function (attributes) {
					var i = 0,
						length = attributes.length,
						attribute,
						name,
						value;

					while (i < length) {
						attribute = attributes[i++];
						name = attribute.name;
						value = attribute.value;

						// false values indicate that an attribute should be removed
						if (value === false) {
							element.removeAttribute(name);
						}
						else {
							element.setAttribute(name, value);
						}
					}
				});


				// empty the children (in case we're using an existing element)
				// TODO: should this be a call to unrender? is it even needed?
				domConstruct.empty(element);

				// place the children into the element
				while (i < length) {
					element.appendChild(childNodes[i++]);
				}

				return element;
			});
		},

		unrender: function (node) {
			// TODO:
		},

		destroy: function () {
			// TODO:
		}
	};

	return ElementRenderer;
});
define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function ElementRender(astNode) {
		//	summary:
		//		Manages the rendering and updating of a DOM Element
		//	astNode:
		//		The AST node that describes this Element

		var i,
			length,
			astAttributes = astNode.attributes,
			attributes = this.attributes = [];

		this.nodeName = astNode.nodeName;

		this.statements = new Renderers.Statements(astNode.statements);

		for (i = 0, length = astAttributes.length; i < length; i++) {
			attributes.push(new Renderers.Attribute(astAttributes[i]));
		}
	}

	ElementRender.prototype = {
		constructor: ElementRender,

		render: function (context, template) {
			//	summary:
			//		Generates a DOM element and renders the attributes and childNodes.
			//	context:
			//		The context for resolving references to variables
			//	template: framework/Template
			//	returns: DOMElement

			// TODO: cloneNode
			var element = this.element || (this.element = template.dom(this.nodeName)),
				childNodes = this.statements.render(context, template, element),
				attributes = this.attributes,
				i,
				length;

			// render the attributes
			for (i = 0, length = attributes.length; i < length; i++) {
				attributes[i].render(context, template, element);
			}

			// empty the children (in case we're using an existing element)
			template.emptyNode(element);

			// render the children into the element
			for (i = 0, length = childNodes.length; i < length; i++) {
				bind.when(childNodes[i], function (child) {
					element.appendChild(child);
				});
			}

			return element;
		},

		unrender: function (node) {
			// TODO:
		},

		destroy: function () {
			// TODO:
		}
	};

	return ElementRender;
});
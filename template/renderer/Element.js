define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

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

		render: function (context, template) {
			//	summary:
			//		Generates a DOM element and renders the attributes and childNodes.
			//	context:
			//		The context for resolving references to variables
			//	template: framework/Template
			//	returns: DOMElement

			// TODO: cloneNode
			var element = this.element || (this.element = template.domCreate(this.nodeName)),
				childNodes = this.statements.render(context, template, element),
				i,
				length;

			// render the attributes
			this.attributes.render(context, template, element);

			// empty the children (in case we're using an existing element)
			// TODO: should this be a call to unrender? is it even needed?
			template.emptyNode(element);

			// render the children into the element
			for (i = 0, length = childNodes.length; i < length; i++) {
				bind.when(childNodes[i], function (child) {
					// TODO: this won't maintain proper order
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

	return ElementRenderer;
});
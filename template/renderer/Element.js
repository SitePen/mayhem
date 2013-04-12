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
				args = [].slice.call(arguments, 0, 3).concat(element),
				statements = this.statements,
				attributes = this.attributes,
				childNodes = statements.render.apply(statements, args),
				i,
				length;

			// render the attributes
			attributes.render.apply(attributes, args);

			// empty the children (in case we're using an existing element)
			// TODO: should this be a call to unrender? is it even needed?
			domConstruct.empty(element);

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
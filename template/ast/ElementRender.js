define([
	'./Renderers',
	'dbind/bind'
], function (Renderers, bind) {

	function ElementRender(astNode) {
		var i,
			length,
			attributes = astNode.attributes,
			attributeRenderers = this.attributes = [];

		this.nodeName = astNode.nodeName;

		this.program = new Renderers.Program(astNode.program);

		for (i = 0, length = attributes.length; i < length; i++) {
			attributeRenderers.push(new Renderers.AttributeNode(attributes[i]));
		}
	}

	ElementRender.prototype = {
		constructor: ElementRender,

		render: function (context, template) {
			// TODO: cloneNode
			var element = this.element || (this.element = template.dom(this.nodeName)),
				childNodes = this.program.render(context, template, element),
				attributes = this.attributes,
				i,
				length;

			for (i = 0, length = attributes.length; i < length; i++) {
				attributes[i].render(context, template, element);
			}

			// TODO: empty the previous children
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
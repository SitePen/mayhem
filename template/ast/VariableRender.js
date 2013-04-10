define([
	'dbind/bind'
], function (bind) {

	function VariableRender(astNode) {
		//	summary:
		//		Manages the rendering of an AST node that represents a variable
		//	astNode:
		//		The AST node describing the variable

		var id = astNode.id;

		this.id = id;
		this.segments = id.split('.');
		this.bound = astNode.bound;
		this.unescaped = astNode.unescaped;
		this.inverted = astNode.inverted;
	}

	VariableRender.prototype = {
		constructor: VariableRender,

		render: function (context, template) {
			//	summary:
			//		Resolves a variable based on the context and returns the value.
			//	context:
			//		The context to be used to resolve the variable.
			//	template: framework/Template
			//	returns:
			//		The value of that variable based on the context

			var segments = this.segments.slice(),
				bound = this.bound,
				inverted = this.inverted,
				unescaped = this.unescaped,
				property;

			if (bound) {
				context = bind(context);
				while (segments.length) {
					context = context.get(segments.shift());
				}
			}
			else {
				while (segments.length && context) {
					property = segments.shift();
					context = typeof context.get === 'function' ?  context.get(property) : context[property];
				}
			}

			return bind(function (value) {
				if (inverted) {
					value = !value;
				}

				// TODO: this coercion probably isn't working right
				value = value == null ? '' :  value;

				if (!unescaped && typeof value === 'string') {
					// TODO: unescaped values are not coerced to a string.  is this right?  somehow
					// for attribute values, we need to know when an attribute like hidden should be
					// removed rather than be an empty string
					value = template.htmlEscape(value);
				}

				return value;
			}).to([context]);
		},

		unrender: function () {

		},

		destroy: function () {

		}
	};

	return VariableRender;
});
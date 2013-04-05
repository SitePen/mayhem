define([
	'dbind/bind'
], function (bind) {

	function IdRender(astNode) {
		//	summary:
		//		Manages the rendering of an AST node that represents and Identifier
		//	astNode:
		//		The AST node describing the Identifier

		var path = astNode.path;

		this.path = path;
		this.segments = path.split('.');
		this.bound = astNode.bound;
		this.escaped = astNode.escaped;
		this.inverse = astNode.inverse;
	}

	IdRender.prototype = {
		constructor: IdRender,

		render: function (context, template) {
			//	summary:
			//		Resolves an Identifier based on the context and returns the value.
			//	context:
			//		The context to be used to resolve the identifier.
			//	template: framework/Template
			//	returns:
			//		The value of that Identifier based on the context

			var segments = this.segments.slice(),
				bound = this.bound,
				inverse = this.inverse,
				escaped = this.escaped,
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
				if (inverse) {
					value = !value;
				}

				// TODO: this coercion probably isn't working right
				value = value == null ? '' :  value;

				if (escaped) {
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

	return IdRender;
});
define([
	'dbind/bind',
	'./peg/expressionParser',
	'dojo/_base/lang'
], function (bind, expressionParser, lang) {

	function resolve(/*Object*/ context, /*Array*/ references) {
		// summary:
		//		Look up a nested property given the parts of a dot expression
		//		(e.g., object.property.deeperProperty).
		// context:
		//		Where to start
		// references:
		//		An array of property names to successively apply
		// returns:
		//		The value of the target property

		var current = context;
		for (var i = 0; i < references.length; i++) {
			current = current[references[i]];
		}
		return current;
	}

	function getValue(/*Object*/ context, /*Object*/ expressionAst) {
		// summary:
		//		Gets the value of the expression target
		// context:
		//		The context to which the expression is applied
		// expressionAst:
		//		The expression AST

		var type = expressionAst.type,
			negate = false,
			value;

		if (type === 'dot-expression') {
			var object = resolve(context, expressionAst.references);
			value = object[expressionAst.target];
			negate = expressionAst.negated;
		}
		else if (type === 'function-call') {
			var name = expressionAst.name,
				func = lang.hitch(resolve(context, name.references), name.target);
			value = func(getValue(context, expressionAst.argument));
			negate = name.negated;
		}
		else if (type === 'number' || type === 'string') {
			value = expressionAst.value;
		}
		else {
			throw new Error('Unrecognized data binding expression type: ' + type);
		}

		return negate ? !value : value;
	}

	function negateValue(value) {
		return !value;
	}

	function filterCallback(callback, filter) {
		return function () {
			callback(filter(arguments[0]));
		}
	}

	function DataBindingExpression(/*String|Object*/ expression) {
		// summary:
		//		A data binding expression
		// description:
		//		This is a constructor for a data binding expression.
		//		Data binding expressions support property references, single function calls, negations,
		//		and numeric and string literals.
		//
		//		Examples of supported expressions:
		//		| someProperty
		//		| !someProperty
		//		| someProperty.deeperProperty.evenDeeperProperty
		//		| date('yyyy')
		//		| router.createPath('index')
		//		| !someObject.isMatching(someField)
		//		| enableSomething(!disabled)
		//		| 123.45
		//		| '12345'
		//
		// expression:
		//		An expression string or a pre-generated expression AST.

		this.expressionAst = typeof expression === 'string'
			? expressionParser.parse(expression)
			: expression;
	}
	DataBindingExpression.prototype = {
		getValue: function (/*Object*/ context) {
			// summary:
			// 		Get the value of the expression applied to the specified context.
			// context:
			//		The context to which the expression is applied
			// returns:
			//		The evaluated value
			return getValue(context, this.expressionAst);
		},
		bind: function (/*Object*/ context, /*Function*/ callback) {
			// summary:
			//		Bind to the expression target.
			// context:
			//		The context to which the expression is applied
			// callback:
			//		The function called when first bound and everytime the target changes

			var expressionAst = this.expressionAst,
				type = expressionAst.type;

			if (type === 'function-call') {
				var name = expressionAst.name,
					negate = name.negated,
					func = lang.hitch(resolve(context, name.references), name.target);

				// Wrap callback so it is passed the result of this function
				// when the bound argument changes.
				callback = filterCallback(callback, func);
				if(negate) {
					callback = filterCallback(callback, negateValue);
				}

				expressionAst = expressionAst.argument;
				type = expressionAst.type;
			}

			if (type === 'dot-expression') {
				var identifiers = expressionAst.references,
					targetProperty = expressionAst.target,
					object = resolve(context, identifiers);

				if(expressionAst.negated) {
					callback = filterCallback(callback, negateValue);
				}

				if (object && targetProperty in object) {
					bind(object).get(expressionAst.target).getValue(callback);
				}
				else {
					// TODO: Report errors to the console instead and add such reporting to getValue and function resolution.
					callback(new Error(identifiers.join('.') + '.' + targetProperty + ' is undefined'));
				}
			}
			else if (type === 'number' || type === 'string') {
				callback(expressionAst.value);
			}
			else {
				throw new Error('Unrecognized data binding expression type: ' + type);
			}

			// TODO: Return handle with remove() method.
		}
	};

	return DataBindingExpression;
});
define([
	'dbind/bind',
	'./peg/expressionParser',
	'dojo/_base/lang',
	'dojo/_base/array'
], function (bind, expressionParser, lang, arrayUtil) {

	// TODO: Consider whether an eval() or Function()-based approach would be better than manually applying expressions like we do now.

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

	function negateValue(value) {
		// summary:
		//		Negates the specified value and returns it
		return !value;
	}

	var slice = [].slice;
	function pipe(from, to) {
		// summary:
		//		Create a function that pipes the return value of the first function to the second function.
		// from:
		//		The function to pass arguments to
		// to:
		//		The function that receives the return value of the first function
		// returns: Function
		//		The pipe function

		return function () {
			var args = slice.call(arguments);
			return to(from.apply(null, args));
		};
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

	function bindToContext(/**Object*/ context, /**Object*/ expressionAst, /**Function*/ callback) {
		// summary:
		//		Apply the expression to the context and bind.
		// context:
		//		The context to which the expression is applied
		// expressionAst:
		//		The AST of the expression to apply.
		// callback:
		//		The function called when first bound and everytime the target changes

		var type = expressionAst.type;

		if (type === 'dot-expression') {
			var identifiers = expressionAst.references,
				targetProperty = expressionAst.target,
				object = resolve(context, identifiers);

			if (expressionAst.negated) {
				callback = pipe(negateValue, callback);
			}

			if (object && targetProperty in object) {
				bind(object).get(expressionAst.target).getValue(callback);
			}
			else {
				// TODO: Report errors to the console instead and add such reporting to getValue and function resolution.
				callback(new Error(identifiers.join('.') + '.' + targetProperty + ' is undefined'));
			}
		}
		else if (type === 'function-call') {
			var name = expressionAst.name,
				negate = name.negated,
				argumentAsts = expressionAst.arguments,
				func = lang.hitch(resolve(context, name.references), name.target);

			if (negate) {
				func = pipe(func, negateValue);
			}

			if (argumentAsts.length === 0) {
				// There are no arguments to bind to. Just call the function once.
				callback(func());
			}
			else if(argumentAsts.length === 1) {
				// There is a single argument so we can bind directly to that.

				// Wrap callback so it is passed the result of this function
				// when the bound argument changes.
				bindToContext(context, argumentAsts[0], pipe(func, callback));
			}
			else {
				// There are multiple arguments to bind to.

				var argumentExpressions = arrayUtil.map(argumentAsts, function (argumentAst) {
					return new DataBindingExpression(argumentAst);
				});

				// To keep it simple, create a shared callback that simply
				// gets the value of all bound arguments and passes them to the function.
				var sharedCallback = function () {
					var args = arrayUtil.map(argumentExpressions, function (argumentExpression) {
						return argumentExpression.getValue(context);
					});
					return func.apply(null, args);
				};
				sharedCallback = pipe(sharedCallback, callback);
				// TODO: Find a way to avoid callback on bind(). Because of our use of dbind, this will result in the callback being called for each argument we bind with.
				arrayUtil.forEach(argumentExpressions, function (argumentExpression) {
					argumentExpression.bind(context, sharedCallback);
				});
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

			return bindToContext(context, this.expressionAst, callback);
		}
	};

	return DataBindingExpression;
});
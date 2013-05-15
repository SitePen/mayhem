define([
	'dbind/bind',
	'./peg/expressionParser',
	'dojo/_base/lang',
	'dojo/date/locale'
], function (bind, expressionParser, lang, dateLocale) {

	function resolve(context, references) {
		var current = context;
		for (var i = 0; i < references.length; i++) {
			current = current[references[i]];
		}
		return current;
	}

	function getValue(context, expressionAst) {
		var type = expressionAst.type;

		if (type === 'dot-expression') {
			var object = resolve(context, expressionAst.references);
			return object[expressionAst.target];
		}
		else if (type === 'function-call') {
			var name = expressionAst.name,
				func = lang.hitch(resolve(context, name.references), name.target);
			return func(getValue(context, expressionAst.argument));
		}
		else if (type === 'number' || type === 'string') {
			return expressionAst.value;
		}
		else {
			throw new Error('Unrecognized data binding expression type: ' + type);
		}
	}

	var bindingHelperFunctions = {
		// TODO: Implement date function
		date: function (format) {
			return dateLocale.format(new Date(), { selector: 'date', datePattern: format });
		}
	};
	// TODO: Determine how standard data binding context should be supported. This is probably not the way.
	// TODO: Choose better name.
	function enrichContext(context) {
		return lang.delegate(
			context,
			lang.mixin({}, bindingHelperFunctions, {
				app: context.app,
				router: context.app.router
			})
		);
	}

	function DataBindingExpression(stringOrAst) {
		this.expressionAst = typeof stringOrAst === 'string'
			? expressionParser.parse(stringOrAst)
			: stringOrAst;
	}
	DataBindingExpression.prototype = {
		getValue: function (context) {
			context = enrichContext(context);
			return getValue(context, this.expressionAst);
		},
		bind: function (context, callback) {
			context = enrichContext(context);

			var expressionAst = this.expressionAst,
				type = expressionAst.type;

			if (type === 'function-call') {
				var name = expressionAst.name,
					func = lang.hitch(resolve(context, name.references), name.target);

				callback = (function (callback) {
					return function (value) {
						callback(func(value));
					};
				})(callback);

				expressionAst = expressionAst.argument;
				type = expressionAst.type;
			}

			if (type === 'dot-expression') {
				var identifiers = expressionAst.references,
					targetProperty = expressionAst.target,
					object = resolve(context, identifiers);

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
define([ './bindingExpressionRegistry' ], function (bindingExpressionRegistry) {
	return {
		// summary:
		//		This module handles the case where a data binding expression is combined
		//		with other string content or more data binding expressions.
		//		For example: `<div class="container ${ customClassName }">...</div>`

		containsBindingExpression: function (rawInput) {
			// summary:
			//		Ask whether the given string contains a data binding expression
			// rawInput: String
			// 		The string to examine
			// returns: boolean
			//		Whether the string contains a data binding expression
			return /\$\{\s*[^\s]+\s*\}/.test(rawInput);
		},
		bind: function (rawInput, context, callback) {
			// summary:
			//		Create a single binding out of a string containing one or more binding expressions
			// context: Object
			//		The context to bind to
			// callback: Function
			//		The function to call when the compound value changes
			// returns:
			// 		TODO: Should return a handle with a remove() method

			var boundExpressionPattern = /\$\{((?:.(?!\$\{))*)}/g;

			var parts = [],
				createBindingCallback = function (partIndex) {
					return function (newValue) {
						parts[partIndex] = newValue;
						callback(parts.join(""));
					};
				};

			for (var match, remainderIndex = 0;
				(match = boundExpressionPattern.exec(rawInput));
				remainderIndex = match.index + match[0].length) {

				if(remainderIndex < match.index) {
					parts.push(rawInput.substring(remainderIndex, match.index));
				}

				var expression = bindingExpressionRegistry.match(match[1]);
				parts.push("");
				expression.bind(context, createBindingCallback(parts.length - 1));
			}

			if (remainderIndex < rawInput.length) {
				parts.push(rawInput.substr(remainderIndex));
			}
		}
	};
});
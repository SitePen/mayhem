define([ './bindingExpressionRegistry' ], function (bindingExpressionRegistry) {
	// summary:
	//      This module handles the case where a data binding expression is combined
	//      with other string content or more data binding expressions.
	//		For example: `<div class="container ${ customClassName }">...</div>`

	function AttributeBinding(rawInput) {
		var boundExpressionPattern = /\$\{([^}]+)\}/g;

		var parts = this.parts = [],
			bindingExpressions = this.bindingExpressions = [];

		for (var match, remainderIndex = 0;
			(match = boundExpressionPattern.exec(rawInput));
			remainderIndex = match.index + match[0].length) {

			if(remainderIndex < match.index) {
				parts.push(rawInput.substring(remainderIndex, match.index));
			}

			bindingExpressions.push({
				partIndex: parts.length,
				expression: bindingExpressionRegistry.match(match[1])
			});
			parts.push("");
		}

		if (remainderIndex < rawInput.length) {
			parts.push(rawInput.substr(remainderIndex));
		}
	}
	AttributeBinding.prototype = {
		bind: function (context, callback) {
			// summary:
			//		Create a single binding out of a string containing one or more binding expressions
			// context: Object
			//		The context to bind to
			// callback: Function
			//		The function to call when the compound value changes
			// returns:
			// 		TODO: Should return a handle with a remove() method

			var parts = this.parts.splice(0);
			function createBindingCallback(partIndex) {
				return function (newValue) {
					parts[partIndex] = newValue;
					callback(parts.join(""));
				};
			}

			for (var i = 0; i < this.bindingExpressions.length; ++i) {
				var expressionInfo = this.bindingExpressions[i];
				expressionInfo.expression.bind(context, createBindingCallback(expressionInfo.partIndex));
			}
		}
	};
	AttributeBinding.containsBindingExpression = function (rawInput) {
		// summary:
		//		Ask whether the given string contains a data binding expression
		// rawInput: String
		// 		The string to examine
		// returns: boolean
		//		Whether the string contains a data binding expression
		return /\$\{\s*[^\s]+\s*\}/.test(rawInput);
	};

	return AttributeBinding;
});
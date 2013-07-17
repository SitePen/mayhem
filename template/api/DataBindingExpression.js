define([ "dojo/_base/declare" ], function (declare) {
	function DataBindingExpression(rawExpression) {
		// summary:
		//		A data binding expression
		// rawExpression: String
		//		A raw expression string
	}

	DataBindingExpression.prototype = {
		bind: function (context, callback) {
			// summary:
			//		Bind the expression to the context
			// context: Object
			//		The context to which to apply the expression
			// callback: Function
			//		The function to call when the expression first has a value and when the expression's inputs change
			// returns:
			//		An object with a remove() method that can be called to unbind from the context
		},

		getValue: function(context) {
			// summary:
			//		Apply the expression to the context and returns its value
			// context: Object
			//		The context to which to apply the expression
			// returns:
			//		The value of the expression
		}
	};

	DataBindingExpression.isMatch = function (rawExpression) {
		// summary:
		//		Answer whether a given expression is an instance of this expression syntax.
		// rawExpression: String
		//		The string to inspect
		// returns: boolean
		//		Whether the given expression is an instance of this syntax
	}

	return DataBindingExpression;
});
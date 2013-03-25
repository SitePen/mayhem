define([], function () {
	return function (template, options) {
		/*jshint quotmark:false*/

		//	summary:
		//		Creates a templating function that, when called, returns a string containing the results of the
		//		interpolated data. This is "modified Underscore" templating, optimized for speed. The delimiters used
		//		are always the following:
		//
		//		<% %> - A block of JavaScript
		//		<%= %> - A JavaScript expression whose value is automatically escaped to avoid XSS injection
		//		<%!= %> - A JavaScript expression whose value is not automatically escaped
		//
		//		The generated function should normally be called using .call(dataObject), and properties of the data
		//		object should be accessed via `this`.
		//	template: string
		//		The template string.
		//	options: Object
		//		Options for the generated function:
		//		* format ('json', 'html'): The type of escaping to use. Defaults to 'html'.
		//		* sourceUrl (string): A string used for the source URL of the generated function.

		options = options || {};

		function generateEscapedExpression(code, leaveUnescaped) {
			//	summary:
			//		Generates an expression that escapes the toString result of the expression in `code`.
			//		Defaults to HTML escaping, but can be modified by specifying the type of template that is being
			//		generated in `options`.
			//
			//	returns: string

			if (leaveUnescaped || options.escape === false) {
				return code;
			}

			code = '(' + code + ').toString()';

			if (options.format === 'json') {
				code += ".replace(/[\\\\'\"]/g, '\\\\$&')";
			}
			else {
				code += ".replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#039;')";
			}

			return code;
		}

		// the generated template function creates a scoped variable __p onto which strings are pushed; the data pushed
		// to this array is what gets output when the template function is called
		return new Function('var __p=[];__p.push(\'' +

			// backslashes are escaped because ???
			template.replace(/\\/g, '\\\\')

			// single-quotes are escaped everywhere since everything from the template string *not*
			// inside delimiters is treated as a string and placed inside a generated single-quoted JavaScript string.
			// if they are not escaped, they will generate an invalid string
			.replace(/'/g, "\\'")

			// for each instance of <%= or <%!=, the results of the expression between the delimiters are evaluated as
			// literal JavaScript and are added to the results array
			.replace(/<%(!?)=([\s\S]+?)%>/g, function (match, unescapeCharacter, code) {
				// single-quotes need to be unescaped since they are supposed to be evaluted as literal JavaScript but
				// we pre-escaped them
				return "'," + generateEscapedExpression(code.replace(/\\'/g, "'"), unescapeCharacter === '!') + ",'";
			})

			// all other instances of <% cause the __p.push() call to be closed so the code inside the condition can be
			// evaluated without being added to the output array
			.replace(/<%([\s\S]+?)%>/g, function (match, code) {
				// this is also intended to be evaluated as literal JavaScript and so single-quotes are unescaped;
				// \r\n\t literals are converted into spaces because ??? (ASI?)
				return "');" + code.replace(/\\'/g, "'").replace(/[\r\n]/g, ' ') + ";__p.push('";
			})

			// literal newline characters are replaced with their escaped equivalents because these characters are not
			// allowed within strings
			.replace(/\r/g, '\\r')
			.replace(/\n/g, '\\n')

		+ "');return __p.join('');" + (options.sourceUrl ? '\n//@ sourceURL=' + options.sourceUrl : ''));
	};
});
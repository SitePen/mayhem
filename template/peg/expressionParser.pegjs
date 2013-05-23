start
	= FunctionCall
	/ DotExpression
	/ StringLiteral
	/ NumericLiteral

// TODO: Support multiple arguments.
// TODO: Support chained function calls.
FunctionCall
	= functionIdentifier:DotExpression '(' S*
		leadingArgument:FunctionArgument? trailingArguments:(',' arg:FunctionArgument { return arg; })*
	S* ')' S* {
		var arguments = trailingArguments;
		if (leadingArgument) {
			arguments.unshift(leadingArgument);
		}

		return {
			type: 'function-call',
			name: functionIdentifier,
			arguments: arguments
		};
	}

FunctionArgument
	= DotExpression / StringLiteral / NumericLiteral

DotExpression
	= negated:'!'? references:(identifier:PaddedIdentifier '.' { return identifier; })* target:PaddedIdentifier {
		return {
			type: 'dot-expression',
			references: references,
			target: target,
			negated: !!negated
		};
	}

PaddedIdentifier
	= S* identifier:Identifier S* { return identifier; }

// TODO: This is a quick implementation that doesn't support all valid Ecmascript identifiers. Fix it.
Identifier
	= head:[$_a-zA-Z] tail:[$_a-zA-Z0-9]* {
		return head + tail.join('');
	}

StringLiteral
	= value:(
		("'" value:("\\'" { return "'" } / [^'\r\n])* "'" { return value.join(''); })
		/ ('"' value:('\\"' { return '"' } / [^"\r\n])* '"' { return value.join(''); })
	) {
		return {
			type: 'string',
			value: value
		};
	}

NumericLiteral
	= DecimalLiteral

// TODO: Hex literal
// TODO: Octal literal

// TODO: Update with full support for ECMAScript decimal literals
DecimalLiteral
	= numberString:(
		(integer:[0-9]+ point:'.' fractional:[0-9]+ { return integer.join('') + point + fractional.join(''); })
		/ (point: '.' fractional:[0-9]+ { return point + fractional; })
		/ [0-9]+
	) {
		return {
			type: 'number',
			value: +numberString
		};
	}

S "whitespace"
	= [ \t\r\n]
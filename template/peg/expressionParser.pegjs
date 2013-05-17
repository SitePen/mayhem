start
	= FunctionCall
	/ DotExpression
	/ StringLiteral
	/ NumericLiteral

// TODO: Support multiple arguments.
// TODO: Support chained function calls.
FunctionCall
	= functionIdentifier:DotExpression '(' S*
		argument:(DotExpression / StringLiteral / DecimalLiteral)
	S* ')' S* {
		return {
			type: 'function-call',
			name: functionIdentifier,
			argument: argument
		};
	}

// TODO: Find a better name for this.
DotExpression
	= references:(identifier:PaddedIdentifier '.' { return identifier; })* target:PaddedIdentifier {
		return {
			type: 'dot-expression',
			references: references,
			target: target
		};
	}

PaddedIdentifier
	= S* identifier:Identifier S* { return identifier; }

// TODO: This is a quick implementation that doesn't support all valid Ecmascript identifiers. Fix it.
Identifier
	= lead:[$_a-zA-Z] tail:[$_a-zA-Z0-9]* {
		return lead + tail.join('');
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
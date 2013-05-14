// TODO: Support object dot notation
start
	= FunctionCall
	/ IdentifierReference

FunctionCall
	= S* functionIdentifier:Identifier S* '(' S*
		argument:(Identifier / StringLiteral / DecimalLiteral)
	S* ')' S* {
		return {
			type: 'function-call',
			name: functionIdentifier.value,
			argument: argument
		};
	}

IdentifierReference
	= S* identifier:Identifier S* { return identifier; }

// TODO: This is a quick implementation that doesn't support all valid Ecmascript identifiers. Fix it.
Identifier
	= lead:[$_a-zA-Z] tail:[$_a-zA-Z0-9]* {
		return {
			type: 'identifier',
			value: lead + tail.join('')
		};
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
	= [\s]
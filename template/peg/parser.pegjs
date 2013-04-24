{
	function flatten(data) {
		return Array.prototype.concat.apply([], data).join('');
	}
}

Template
	= Node*

Node
	= OutputNode
	/ BlockNode
	/ RawNode

OutputNode
	= OpenToken '=' S* variable:Variable S* CloseToken {
		return {
			type: 'output',
			variable: variable
		};
	}

BlockNode
	= IfBlock
	/ ForBlock
	/ WhenBlock
	/ PlaceholderBlock

RawNode
	= raw:('\\{%' { return '\x7b%'; } / '{' !'%' / [^{])+ {
		return { type: 'raw', value: flatten(raw) };
	}

IfBlock
	= OpenToken S* 'if' S+ condition:ReferenceVariable S* CloseToken consequent:Node* alternates:ElseIfBlock* final:ElseBlock? OpenToken S* 'endif' S* CloseToken {
		return {
			type: 'if',
			conditions: [ { condition: condition, consequent: consequent } ].concat(alternates),
			alternate: final || []
		};
	}

ElseIfBlock
	= OpenToken S* 'else' S+ 'if' S+ condition:ReferenceVariable S* CloseToken consequent:Node* {
		return {
			condition: condition,
			consequent: consequent
		};
	}

ElseBlock
	= OpenToken S* 'else' S* CloseToken consequent:Node* {
		return consequent;
	}

ForBlock
	= OpenToken S* 'for' S+ keyIdentifier:Identifier S* ',' S* valueIdentifier:Identifier S+ 'in' S+ objectIdentifier:ReferenceVariable CloseToken body:Node* OpenToken S* 'endfor' S* CloseToken {
		return {
			type: 'for',
			keyIdentifier: keyIdentifier,
			valueIdentifier: valueIdentifier,
			objectIdentifier: objectIdentifier
		};
	}
	/ OpenToken S* 'for' S+ valueIdentifier:Identifier S+ 'in' S+ objectIdentifier:ReferenceVariable CloseToken body:Node* OpenToken S* 'endfor' S* CloseToken {
		return {
			type: 'for',
			valueIdentifier: valueIdentifier,
			objectIdentifier: objectIdentifier
		};
	}

WhenBlock
	= OpenToken S* 'when' S+ objectIdentifier:Variable S* CloseToken success:Node* error:WhenErrorBlock? progress:WhenProgressBlock? OpenToken S* 'endwhen' S* CloseToken {
		return {
			type: 'when',
			objectIdentifier: objectIdentifier,
			success: success,
			error: error,
			progress: progress
		};
	}

WhenErrorBlock
	= OpenToken S* 'error' errorIdentifier:WhenAsIdentifier? S* CloseToken body:Node* {
		return {
			type: 'whenerror',
			identifier: errorIdentifier || 'error',
			body: body
		};
	}

WhenAsIdentifier
	= S+ 'as' S+ identifier:Identifier {
		return identifier;
	}

WhenProgressBlock
	= OpenToken S* 'progress' progressIdentifier:WhenAsIdentifier? S* CloseToken body:Node* {
		return {
			type: 'whenprogress',
			identifier: progressIdentifier || 'progress',
			body: body
		};
	}

PlaceholderBlock
	= OpenToken S* 'placeholder' identifier:PlaceholderIdentifier? S* CloseToken {
		return {
			type: 'placeholder',
			identifier: identifier || 'default'
		};
	}

PlaceholderIdentifier
	= S+ identifier:Identifier {
		return identifier;
	}

Arguments
	= S* '(' firstArg:Expression? args:Argument* ')' {
		return firstArg ? [ firstArg ].concat(args) : [];
	}

Argument
	= S* ',' S* arg:Expression {
		return arg;
	}

Expression
	= Null
	/ Undefined
	/ Boolean
	/ Number
	/ String
	/ Object

Variable
	= CallVariable
	/ ReferenceVariable

ReferenceVariable
	= identifier:Identifier accessors:(ArrayAccessor / DotAccessor)* {
		return {
			type: 'variable',
			identifier: [ identifier ].concat(accessors)
		};
	}

ArrayAccessor
	= S* '[' S* identifier:Expression S* ']' {
		return identifier;
	}

DotAccessor
	= S* '.' S* identifier:Identifier {
		return identifier;
	}

CallVariable
	= variable:ReferenceVariable args:Arguments {
		return {
			type: 'callvariable',
			variable: variable,
			args: args
		};
	}

Identifier
	= identifier:[a-zA-Z0-9_$]+ {
		return { type: 'identifier', value: identifier.join('') };
	}

String
	= '\'' string:('\\\'' { return '\''; } / [^'])* '\'' {
		return { type: 'literal', value: string.join('') };
	}
	/ '"' string:('\\"' { return '"'; } / [^"])* '"' {
		return { type: 'literal', value: string.join('') };
	}

Number
	= number:(
		HexadecimalNumber
		/ ExponentialNumber
		/ DecimalNumber
	) {
		return { type: 'literal', value: number };
	}

DecimalNumber
	= number:([+-]? [0-9]+ ('.' [0-9]+)?) {
		return +flatten(number);
	}

ExponentialNumber
	= number:([+-]? [0-9]+ 'e'i [0-9]+ ('.' [0-9]+)?) {
		return +flatten(number);
	}

HexadecimalNumber
	= number:([+-]? '0x'i [0-9a-f]i+) {
		return number;
	}

Boolean
	= boolean:('true' / 'false') {
		return { type: 'literal', value: boolean === 'true' };
	}

Null
	= 'null' {
		return { type: 'literal', value: 'null' };
	}

Undefined
	= 'undefined' {
		return { type: 'literal', value: undefined };
	}

Object
	= object:RawObject {
		return { type: 'literal', value: new Function('return ' + flatten(object))() };
	}

RawObject
	= '{' ([^}] / String / RawObject)* '}'
	/ '[' ([^\]] / String / RawObject)* ']'
	/ '/' ('\\/' / [^/])* '/' [gim]*

OpenToken
	= !'\\' '{%'

CloseToken
	= !'\\' '%}'

S
	= [ \t\n\r]
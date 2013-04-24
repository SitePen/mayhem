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
	/ AliasBlock

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

AliasBlock
	= OpenToken S* 'alias' S+ aliases:Aliases S* CloseToken {
		return {
			type: 'alias',
			aliases: aliases
		};
	}

Aliases
	= firstAlias:Alias rest:(S* ',' S* Alias)* {
		var aliases = [ firstAlias ];

		for (var i = 0; i < rest.length; ++i) {
			aliases.push(rest[i][3]);
		}

		return aliases;
	}

Alias
	= from:(Identifier / String) S* ':' S* to:String {
		return {
			type: 'alias',
			from: from,
			to: to
		};
	}

Arguments
	= S* '(' S* firstArg:Literal? args:Argument* S* ')' {
		return firstArg ? [ firstArg ].concat(args) : [];
	}

Argument
	= S* ',' S* arg:Literal {
		return arg;
	}

Literal
	= Null
	/ Undefined
	/ Boolean
	/ Number
	/ String
	/ RegExp
	/ Object
	/ Array

Variable
	= ConditionalVariable
	/ CallVariable
	/ ReferenceVariable

ConditionalVariable
	= condition:ReferenceVariable S* ':' S* value:Literal {
		return {
			type: 'conditionalvariable',
			condition: condition,
			value: value
		};
	}

CallVariable
	= variable:ReferenceVariable args:Arguments {
		return {
			type: 'callvariable',
			variable: variable,
			args: args
		};
	}

ReferenceVariable
	= inverted:'!'? identifier:Identifier accessors:(ArrayAccessor / DotAccessor)* {
		return {
			type: 'variable',
			identifier: [ identifier ].concat(accessors),
			inverted: !!inverted
		};
	}

ArrayAccessor
	= S* '[' S* identifier:Literal S* ']' {
		return identifier;
	}

DotAccessor
	= S* '.' S* identifier:Identifier {
		return identifier;
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
		/ DecimalNumber
	) {
		return { type: 'literal', value: number };
	}

DecimalNumber
	= number:([+-]? [0-9]+) decimal:('.' [0-9]+)? exponent:([eE] [+-]? [0-9]+)? {
		return +(flatten(number) + flatten(decimal || []) + flatten(exponent || []));
	}

HexadecimalNumber
	= sign:[+-]? number:('0' [xX] [0-9a-fA-F]+) {
		return sign === '-' ? 0 - flatten(number) : flatten(number);
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

RegExp
	= regExp:('/' ('\\/' / [^/])* '/' [gim]*) {
		return { type: 'literal', value: new Function('return ' + flatten(regExp))() };
	}

Object
	= '{' S* properties:ObjectLiteralList? S* '}' {
		var value = {};

		if (properties) {
			for (var i = 0; i < properties.length; ++i) {
				value[properties[i].key.value] = properties[i].value;
			}
		}

		return { type: 'object', value: value };
	}

ObjectLiteralList
	= item:ObjectLiteralItem rest:(S* ',' S* ObjectLiteralItem)* {
		var items = [ item ];
		for (var i = 0; i < rest.length; ++i) {
			items.push(rest[i][3]);
		}
		return items;
	}

ObjectLiteralItem
	= key:(Identifier / String) S* ':' S* value:Literal {
		return { type: 'objectitem', key: key, value: value };
	}

Array
	= '[' S* firstArg:Literal? args:Argument* S* ']' {
		return { type: 'array', value: firstArg ? [ firstArg ].concat(args) : [] };
	}

OpenToken
	= !'\\' '{%'

CloseToken
	= !'\\' '%}'

S
	= [ \t\n\r]
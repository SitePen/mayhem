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
	= raw:('\\{%' / '{' !'%' / [^{])+ {
		return Array.prototype.concat.apply([], raw).join('');
	}

IfBlock
	= OpenToken S* 'if' S+ condition:Variable S* CloseToken consequent:Node* alternates:ElseIfBlock* final:ElseBlock? OpenToken S* 'endif' S* CloseToken {
		return {
			type: 'if',
			conditions: [ { condition: condition, consequent: consequent } ].concat(alternates),
			alternate: final
		};
	}

ElseIfBlock
	= OpenToken S* 'else' S+ 'if' S+ condition:Variable S* CloseToken consequent:Node* {
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
	= OpenToken S* 'for' S+ keyIdentifier:Identifier S* ',' S* valueIdentifier:Identifier S+ 'in' S+ objectIdentifier:Variable CloseToken body:Node* OpenToken S* 'endfor' S* CloseToken {
		return {
			type: 'for',
			keyIdentifier: keyIdentifier,
			valueIdentifier: valueIdentifier,
			objectIdentifier: objectIdentifier
		};
	}
	/ OpenToken S* 'for' S+ valueIdentifier:Identifier S+ 'in' S+ objectIdentifier:Variable CloseToken body:Node* OpenToken S* 'endfor' S* CloseToken {
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

Variable
	= variable:[a-zA-Z0-9_$]+ {
		return variable.join('');
	}

Identifier
	= identifier:[a-zA-Z0-9_$]+ {
		return identifier.join('');
	}

OpenToken
	= !'\\' '{%'

CloseToken
	= !'\\' '%}'

S
	= [ \t\n\r]
{
	function OutputNode(variable) {
		this.type = 'output';
		this.variable = variable;
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
		return new OutputNode(variable);
	}

BlockNode
	= IfBlock
/*	/ ForBlock
	/ WhenBlock
	/ PlaceholderBlock*/

RawNode
	= raw:('\\{' / [^{])+ {
		return Array.prototype.concat.apply([], raw).join('');
	}

IfBlock
	= OpenToken S* 'if' S+ condition:Variable S* CloseToken consequent:Node alternates:ElseIfBlock* final:ElseBlock? OpenToken S* 'endif' S* CloseToken {
		return {
			type: 'if',
			conditions: [ { condition: condition, consequent: consequent } ].concat(alternates),
			alternate: final
		};
	}

ElseIfBlock
	= OpenToken S* 'else' S+ 'if' S+ condition:Variable S* CloseToken consequent:Node {
		return {
			condition: condition,
			consequent: consequent
		};
	}

ElseBlock
	= OpenToken S* 'else' S* CloseToken consequent:Node {
		return consequent;
	}

Variable
	= variable:[a-zA-Z0-9_$]+ { return variable.join(''); }

OpenToken
	= !'\\' '{%'

CloseToken
	= !'\\' '%}'

S
	= [ \t\n\r]
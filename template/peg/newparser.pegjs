start
	= Content*

Content
	= IfTag
	/ ForTag
	/ WhenTag
	/ PlaceholderTag
	/ DataTag
	/ HtmlFragment

HtmlFragment
	= content:(
		!IfTagOpen
		!ElseIfTag
		!ElseTag
		!IfTagClose
		!ForTagOpen
		!ForTagClose
		!WhenTagOpen
		!WhenTagClose
		!WhenErrorTag
		!WhenProgressTag
		!PlaceholderTag
		!DataTag
		character:. { return character; }
	)+ {
		return {
			type: 'fragment',
			html: content.join('')
		};
	}

IfTag
	=
	ifObject:IfTagOpen
		ifBlock:Content*
		elseIfBlocks:(ElseIfTag Content*)*
		elseBlock:(ElseTag Content*)?
	IfTagClose {
		ifObject.ifBlock = ifBlock;
		ifObject.elseIfBlocks = elseIfBlocks;
		ifObject.elseBlock = elseBlock;
		return ifObject;
	}

IfTagOpen
	= '<if' attributes:Attributes '>' {
		return {
			type: 'if',
			attributes: attributes
		};
	}

IfTagClose
	= '</if>'

ElseIfTag
	= '<elseif' attributes:Attributes '>' {
		return {
			type: 'elseif',
			attributes: attributes
		};
	}

ElseTag
	= '<else>' { return { type: 'else' }; }

ForTag
	= forNode:ForTagOpen content:Content* ForTagClose {
		forNode.content = content;
		return forNode;
	}

ForTagOpen
	= '<for' attributes:Attributes '>' {
		return {
			type: 'for',
			attributes: attributes
		};
	}

ForTagClose
	= '</for>'

WhenTag
	= whenNode:WhenTagOpen
		resolvedBlock:Content*
		errorBlock:(WhenErrorTag content:Content* { return content; })?
		progressBlock:(WhenProgressTag content:Content* { return content; })?
	WhenTagClose {
		resolvedBlock && (whenNode.resolvedBlock = resolvedBlock)
		errorBlock && (whenNode.errorBlock = errorBlock);
		progressBlock && (whenNode.progressBlock = progressBlock);
		return whenNode;
	}

WhenTagOpen
	= '<when' attributes:Attributes '>' {
		return {
			type: 'when',
			attributes: attributes
		};
	}

WhenTagClose
	= '</when>'

WhenErrorTag
	= '<error>'

WhenProgressTag
	= '<progress>'

PlaceholderTag
	= '<placeholder' attributes:Attributes '>' {
		return {
			type: 'placeholder',
			attributes: attributes
		};
	}

DataTag
	= '<data' attributes:Attributes '>' {
		return {
			type: 'data',
			attributes: attributes
		};
	}

Attributes
	= attributes:Attribute* S* { return attributes; }

Attribute
	= S+ name:AttributeName value:(S* '=' S* value:AttributeValue { return value; })? {
		return {
			type: 'attribute',
			name: name,
			value: value
		};
	}

AttributeName
	= nameChars:[a-zA-Z]+ { return nameChars.join(''); }

AttributeValue
	= ("'" value:("\\'" { return "'" } / [^'\r\n])* "'" { return value.join(''); })
	/ ('"' value:('\\"' { return '"' } / [^"\r\n])* '"' { return value.join(''); })

S
	= [ \t\r\n]
/* Helpers */

{
	function createNodeConstructor(/*String*/ type, /*Array*/ requiredAttributes) {
		// summary:
		//		Creates a constructor for a tag's AST node.
		// type:
		//		The AST node type.
		// requiredAttributes:
		//		The attributes required by the tag.

		var requiredAttributeMap = {};
		for (var i = 0; i < requiredAttributes.length; i++) {
			requiredAttributeMap[requiredAttributes[i]] = true;
		}

		var unsupportedAttributeMessage = 'The ' + name + ' tag does not support attribute: ';

		var Constructor = function (attributes) {
			if (attributes !== undefined) {
				var unsupportedAttributes = [];

				for (var i = 0; i < attributes.length; i++) {
					var attribute = attributes[i];
					if (requiredAttributeMap[attribute.name]) {
						this[attribute.name] = attribute.value;
					}
					else {
						unsupportedAttributes.push(attribute.name);
					}
				}

				if (unsupportedAttributes.length > 0) {
					throw new Error(
						'The ' + name + ' tag does not support the attribute(s): ' + unsupportedAttributes.join(', ')
					);
				}
			}
		};
		Constructor.prototype = {
			type: type
		};
		return Constructor;
	}

	var IfNode = createNodeConstructor('if', [ 'condition' ]);
	var ElseIfNode = createNodeConstructor('elseif', [ 'condition' ]);
	var ElseNode = createNodeConstructor('else', []);
	var ForNode = createNodeConstructor('for', [ 'each', 'value' ]);
	var WhenNode = createNodeConstructor('when', [ 'promise' ]);
	var WhenErrorNode = createNodeConstructor('when-error', []);
	var WhenProgressNode = createNodeConstructor('when-progress', []);
	var PlaceholderNode = createNodeConstructor('placeholder', [ 'id' ]);
	var DataNode = createNodeConstructor('data', [ 'var' ]);
	var AliasNode = createNodeConstructor('alias', [ 'from', 'to' ]);

	function HtmlFragment(html) {
		this.html = html;
	}
	HtmlFragment.prototype = { type: 'fragment' };
}

/* Grammar */

start
	= Content*

Content
	= IfTag
	/ ForTag
	/ WhenTag
	/ PlaceholderTag
	/ DataTag
	/ AliasTag
	/ HtmlFragment

HtmlFragment
	= content:(
		!(
			& '<'		// Attempt to optimize by only checking tag rules
						// when the current character is a '<'
			IfTagOpen
			/ ElseIfTag
			/ ElseTag
			/ IfTagClose
			/ ForTagOpen
			/ ForTagClose
			/ WhenTagOpen
			/ WhenTagClose
			/ WhenErrorTag
			/ WhenProgressTag
			/ PlaceholderTag
			/ DataTag
			/ AliasTag
		)
		character:. { return character; }
	)+ {
		return new HtmlFragment(content.join(''));
	}

IfTag
	=
	ifNode:IfTagOpen
		ifChildren:Content*
		elseIfNodes:(elseIfNode:ElseIfTag children:Content* {
			elseIfNode.children = children;
			return elseIfNode;
		})*
		elseNode:(elseNode:ElseTag children:Content* {
			elseNode.children = children;
			return elseNode;
		})?
	IfTagClose {
		ifNode.ifChildren = ifChildren;
		ifNode.elseIfNodes = elseIfNodes;
		ifNode.elseNode = elseNode;
		return ifNode;
	}

IfTagOpen
	= '<if' attributes:Attributes '>' {
		return new IfNode(attributes);
	}

IfTagClose
	= '</if>'

ElseIfTag
	= '<elseif' attributes:Attributes '>' {
		return new ElseIfNode(attributes);
	}

ElseTag
	= '<else>' { return new ElseNode(); }

ForTag
	= forNode:ForTagOpen children:Content* ForTagClose {
		forNode.children = children;
		return forNode;
	}

ForTagOpen
	= '<for' attributes:Attributes '>' {
		return new ForNode(attributes);
	}

ForTagClose
	= '</for>'

WhenTag
	= whenNode:WhenTagOpen
		resolvedChildren:Content*
		errorNode:(errorNode:WhenErrorTag children:Content* {
			errorNode.children = children;
			return errorNode;
		})?
		progressNode:(progressNode:WhenProgressTag children:Content* {
			progressNode.children = children;
			return progressNode;
		})?
	WhenTagClose {
		resolvedChildren && (whenNode.resolvedChildren = resolvedChildren)
		errorNode && (whenNode.errorNode = errorNode);
		progressNode && (whenNode.progressNode = progressNode);
		return whenNode;
	}

WhenTagOpen
	= '<when' attributes:Attributes '>' {
		return new WhenNode(attributes);
	}

WhenTagClose
	= '</when>'

WhenErrorTag
	= '<error>' { return new WhenErrorNode(); }

WhenProgressTag
	= '<progress>' { return new WhenProgressNode(); }

PlaceholderTag
	= '<placeholder' attributes:Attributes '>' {
		return new PlaceholderNode(attributes);
	}

DataTag
	= '<data' attributes:Attributes '>' {
		return new DataNode(attributes);
	}

AliasTag
	= '<alias' attributes:Attributes '>' {
		return new AliasNode(attributes);
	}

Attributes
	= attributes:Attribute* S* { return attributes; }

Attribute
	= S+ name:AttributeName value:(S* '=' S* value:AttributeValue { return value; })? {
		return { name: name, value: value };
	}

AttributeName
	= nameChars:[a-zA-Z]+ { return nameChars.join(''); }

AttributeValue
	= ("'" value:("\\'" { return "'" } / [^'\r\n])* "'" { return value.join(''); })
	/ ('"' value:('\\"' { return '"' } / [^"\r\n])* '"' { return value.join(''); })

S 'whitespace'
	= [ \t\r\n]
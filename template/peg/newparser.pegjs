/* Helpers */

{
	var nextId = 1;
	function getNextId() {
		return nextId++;
	}

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
						'Type ' + type + ' does not support the attribute(s): ' + unsupportedAttributes.join(', ')
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
	var ForNode = createNodeConstructor('for', [ 'each', 'value' ]);
	var WhenNode = createNodeConstructor('when', [ 'promise' ]);
	var PlaceholderNode = createNodeConstructor('placeholder', [ 'id' ]);
	var DataNode = createNodeConstructor('data', [ 'var' ]);
	var AliasNode = createNodeConstructor('alias', [ 'from', 'to' ]);

	function HtmlFragmentNode(html) {
		this.html = html;
	}
	HtmlFragmentNode.prototype = { type: 'fragment' };
}

/* Grammar */

start
	= ContentOrEmpty

ContentOrEmpty
	= Content?

Content
	= nodes:(
		IfTag
		/ ForTag
		/ WhenTag
		/ PlaceholderTag
		/ DataTag
		/ AliasTag
		/ HtmlFragment
	)+ {
		// Flatten content into a single HTML string
		// with <script id></script> tags marking place for the template control nodes.
		var htmlFragmentBuffer = [];

		var templateNodeMap = {};
		for(var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node instanceof HtmlFragmentNode) {
				htmlFragmentBuffer.push(node.html);
			}
			else {
				var id = getNextId();
				htmlFragmentBuffer.push('<script data-template-id="' + id + '"></script>');
				templateNodeMap[id] = node;
			}
		}

		return {
			html: htmlFragmentBuffer.join(''),
			templateNodeMap: templateNodeMap
		};
	}

HtmlFragment
	= content:(
		!(
			& '<'		// Optimization: Only check tag rules
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
		return new HtmlFragmentNode(content.join(''));
	}

IfTag
	=
	ifNode:IfTagOpen
		ifContent:ContentOrEmpty
		elseIfNodes:(elseIfNode:ElseIfTag content:ContentOrEmpty {
			elseIfNode.content = content;
			return elseIfNode;
		})*
		elseContent:(ElseTag content:ContentOrEmpty { return content; })?
	IfTagClose {
		ifNode.ifContent = ifContent;
		ifNode.elseIfNodes = elseIfNodes;
		ifNode.elseContent = elseContent;
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
	= '<else>'

ForTag
	= forNode:ForTagOpen content:ContentOrEmpty ForTagClose {
		forNode.content = content;
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
		resolvedContent:ContentOrEmpty
		errorContent:(WhenErrorTag content:ContentOrEmpty { return content; })?
		progressContent:(WhenProgressTag content:ContentOrEmpty { return content; })?
	WhenTagClose {
		whenNode.resolvedContent = resolvedContent;
		whenNode.errorContent = errorContent;
		whenNode.progressContent = progressContent;
		return whenNode;
	}

WhenTagOpen
	= '<when' attributes:Attributes '>' {
		return new WhenNode(attributes);
	}

WhenTagClose
	= '</when>'

WhenErrorTag
	= '<error>'

WhenProgressTag
	= '<progress>'

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
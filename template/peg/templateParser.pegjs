/* Helpers */

{
	// Save a reference to the parser so we can call it manually
	var parser = this;

	var nextId = 1;
	function getNextId() {
		// summary:
		//		Get the next template node id

		return nextId++;
	}

	function createConditionalBlock(conditionalNode) {
		// summary:
		//		Create a conditional block object given a conditional template node.
		// conditionalNode: IfNode|ElseIfNode
		//		The node from which to create a conditional block
		// returns: Object
		//		A conditional block 

		return {
			condition: conditionalNode.condition,
			content: conditionalNode.content
		};
	}

	function createNodeConstructor(kwArgs) {
		// summary:
		//		Create a constructor for a tag's AST node.
		// type:
		//		The AST node type.
		// requiredAttributes:
		//		The attributes required by the tag.
		// optionalAttributes:
		//		Non-required attributes allowed by the tag.
		// returns: Function
		// 		A template node constructor

		var type = kwArgs.type,
			requiredAttributes = kwArgs.requiredAttributes || [],
			optionalAttributes = kwArgs.optionalAttributes || [],
			expressionAttributes = kwArgs.expressionAttributes || [];

		var permittedAttributeSet = {};
		for (var i = 0; i < requiredAttributes.length; i++) {
			permittedAttributeSet[requiredAttributes[i]] = true;
		}
		for (var i = 0; i < optionalAttributes.length; i++) {
			permittedAttributeSet[optionalAttributes[i]] = true;
		}

		var Constructor = function (attributeSet) {
			attributeSet = attributeSet || {};

			// Make sure required attributes are present
			var missingAttributes = [];
			for (var i = 0; i < requiredAttributes.length; i++) {
				if (!(requiredAttributes[i] in permittedAttributeSet)) {
					missingAttributes.push(requiredAttributes[i]);
				}
			}

			if (missingAttributes.length) {
				throw new Error(
					'Type ' + type + ' is missing required attribute(s): ' + missingAttributes.join(', ')
				);
			}

			// Apply attributes
			var unsupportedAttributes = [];
			for (var name in attributeSet) {
				if (name in permittedAttributeSet) {
					this[name] = attributeSet[name];
				}
				else {
					unsupportedAttributes.push(attribute.name);
				}
			}

			// Report unsupported attributes
			if (unsupportedAttributes.length > 0) {
				throw new Error(
					'Type ' + type + ' does not support the attribute(s): ' + unsupportedAttributes.join(', ')
				);
			}

			// Parse data binding expressions
			for (var i = 0, attributeName; i < expressionAttributes.length; i++) {
				attributeName = expressionAttributes[i];
				if (attributeName in this) {
					// TODO: Fix this. This is a hack. Newer versions of pegjs generate a named parse() function that may be called directly here.
					this[attributeName] = parser.parse(this[attributeName], 'DataBindingExpression');
				}
			}
		};
		Constructor.prototype = {
			type: type
		};
		return Constructor;
	}
	var IfNode = createNodeConstructor({
			type: 'if',
			requiredAttributes: [ 'condition' ],
			expressionAttributes: [ 'condition' ]
		}),
		ElseIfNode = createNodeConstructor({
			type: 'elseif',
			requiredAttributes: [ 'condition' ],
			expressionAttributes: [ 'condition' ]
		}),
		ForNode = createNodeConstructor({
			type: 'for',
			requiredAttributes: [ 'each', 'value' ],
			expressionAttributes: [ 'each' ]
		}),
		WhenNode = createNodeConstructor({
			type: 'when',
			requiredAttributes: [ 'promise' ],
			optionalAttributes: [ 'value' ],
			expressionAttributes: [ 'promise' ]
		}),
		PlaceholderNode = createNodeConstructor({
			type: 'placeholder',
			requiredAttributes: [ 'name' ]
		}),
		DataNode = createNodeConstructor({
			type: 'data',
			requiredAttributes: [ 'var' ],
			optionalAttributes: [ 'safe' ],
			expressionAttributes: [ 'var' ]
		}),
		AliasNode = createNodeConstructor({
			type: 'alias',
			requiredAttributes: [ 'from', 'to' ]
		});

	// Using constructor and prototype for HTML fragments to save memory.
	// We don't do this for AST node types because they need to be persisted as JSON downstream,
	// and inherited properties aren't included by JSON.stringify.
	function HtmlFragmentNode(html) {
		this.html = html;
	}
	HtmlFragmentNode.prototype = { type: 'fragment' };

	// TODO: Currently, aliases apply to the whole template regardless of where they are specified. Should they be scoped?
	var aliasMap = {},
		nodeIdAttributeName = 'data-template-node-id';
}

/* Template Grammar */

start
	= content:ContentOrEmpty {
		if (content) {
			// Include the node ID attribute name with the AST so dependent code can stay DRY.
			content.nodeIdAttributeName = nodeIdAttributeName;

			var aliases = [];
			for (var alias in aliasMap) {
				aliases.push({ from: alias, to: aliasMap[alias] });
			}
			content.aliases = aliases;
		}
		return content;
	}

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
		// with <script id></script> tags marking place for the template nodes.
		var htmlFragmentBuffer = [],
			templateNodes = [];

		for(var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.type === 'fragment') {
				htmlFragmentBuffer.push(node.html);
			}
			else if (node.type === 'alias') {
				if (aliasMap[node.from]) {
					throw new Error('Alias "' + node.from + '" has already been defined');
				}
				aliasMap[node.from] = node.to;
			}
			else {
				// TODO: Colin prefers the use of comment nodes, but it appears we'll need to stick w/ <script> for this step since it is queryable.
				node.id = getNextId();
				htmlFragmentBuffer.push('<script ' + nodeIdAttributeName + '="' + node.id + '"></script>');
				templateNodes.push(node);
			}
		}

		// TODO: Make proper constructor for this.
		return {
			type: 'content',
			html: htmlFragmentBuffer.join(''),
			templateNodes: templateNodes
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
	= ifNode:IfTagOpen
		content:ContentOrEmpty
		elseIfNodes:(elseIfNode:ElseIfTag content:ContentOrEmpty {
			elseIfNode.content = content;
			return elseIfNode;
		})*
		elseContent:(ElseTag content:ContentOrEmpty { return content; })?
	IfTagClose {
		ifNode.content = content;

		// Combine 'if' and 'elseif' into ordered list of conditional blocks
		var conditionalBlocks = [ createConditionalBlock(ifNode) ];
		while (elseIfNodes.length > 0) {
			var elseIfNode = elseIfNodes.shift();
			conditionalBlocks.push(createConditionalBlock(elseIfNode));
		}

		// TODO: Create constructor for this transformed 'if' AST node
		return {
			type: 'if',
			conditionalBlocks: conditionalBlocks,
			elseBlock: elseContent ? { content: elseContent } : undefined
		};
	}

IfTagOpen
	= OpenToken 'if' attributes:AttributeSet CloseToken {
		return new IfNode(attributes);
	}

IfTagClose
	= OpenToken '/if' CloseToken

ElseIfTag
	= OpenToken 'elseif' attributes:AttributeSet CloseToken {
		return new ElseIfNode(attributes);
	}

ElseTag
	= OpenToken 'else' CloseToken

ForTag
	= forNode:ForTagOpen content:ContentOrEmpty ForTagClose {
		forNode.content = content;
		return forNode;
	}

ForTagOpen
	= OpenToken 'for' attributes:AttributeSet CloseToken {
		return new ForNode(attributes);
	}

ForTagClose
	= OpenToken '/for' CloseToken

WhenTag
	= whenNode:WhenTagOpen
		resolvedContent:ContentOrEmpty
		errorContent:(WhenErrorTag content:ContentOrEmpty { return content; })?
		progressContent:(WhenProgressTag content:ContentOrEmpty { return content; })?
	WhenTagClose {
		whenNode.resolvedContent = resolvedContent || undefined;
		whenNode.errorContent = errorContent || undefined;
		whenNode.progressContent = progressContent || undefined;
		return whenNode;
	}

WhenTagOpen
	= OpenToken 'when' attributes:AttributeSet CloseToken {
		return new WhenNode(attributes);
	}

WhenTagClose
	= OpenToken '/when' CloseToken

WhenErrorTag
	= OpenToken 'error' CloseToken

WhenProgressTag
	= OpenToken 'progress' CloseToken

PlaceholderTag
	= OpenToken 'placeholder' attributes:AttributeSet CloseToken {
		return new PlaceholderNode(attributes);
	}

DataTag
	= OpenToken 'data' attributes:AttributeSet CloseToken {
		return new DataNode(attributes);
	}

AliasTag
	= OpenToken 'alias' attributes:AttributeSet CloseToken {
		return new AliasNode(attributes);
	}

AttributeSet
	= attributes:Attribute* S* {
		var attributeMap = {};
		for (var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];

			if (attributeMap[attribute.name]) {
				throw new Error('A "' + attribute.name + '" has already been specified');
			}

			attributeMap[attribute.name] = attribute.value;
		}

		return attributeMap;
	}

Attribute
	= S+ name:AttributeName value:(S* '=' S* value:AttributeValue { return value; })? {
		return { name: name, value: value };
	}

AttributeName
	= nameChars:[a-zA-Z]+ { return nameChars.join(''); }

AttributeValue
	= ("'" value:("\\'" { return "'" } / [^'\r\n])* "'" { return value.join(''); })
	/ ('"' value:('\\"' { return '"' } / [^"\r\n])* '"' { return value.join(''); })

OpenToken
	= '<' S*

CloseToken
	= S* '>'

/* Data-binding Expression Grammar */

DataBindingExpression
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

/* General-purpose Rules */

S 'whitespace'
	= [ \t\r\n]
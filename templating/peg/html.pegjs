/* Helpers */

{
	/**
	 * Validates that the attributes provided in the given attribute map are correct according to the provided rules.
	 */
	function validate(attributes, rules) {
		var required = rules.required || [],
			optional = rules.optional || [],
			type = rules.type ? ' ' + rules.type : '';

		var i = 0,
			permitted = {};

		for (i = 0; i < required.length; ++i) {
			permitted[required[i]] = true;
		}
		for (i = 0; i < optional.length; ++i) {
			permitted[optional[i]] = true;
		}

		for (i = 0; i < required.length; ++i) {
			if (!(required[i] in attributes)) {
				throw new Error('Missing required attribute "' + required[i] + '" on' + type + ' node');
			}
		}

		for (var name in attributes) {
			if (!(name in permitted)) {
				throw new Error('Invalid attribute "' + name + '" on' + type + ' node');
			}
		}
	}

	var aliasMap = {};
	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function resolveAliases(node) {
		for (var k in aliasMap) {
			if (node.constructor.indexOf(k) === 0) {
				node.constructor = node.constructor.replace(k, aliasMap[k]);
			}
		}

		if (node.children && node.children.length) {
			for (var i = 0, child; (child = node.children[i]); ++i) {
				resolveAliases(child);
			}
		}
	}
}

/* Template Grammar */

Template
	= content:Content? {
		// If the root of the template contains multiple widgets, or the entire template is empty, it needs to be
		// wrapped up into a single Element widget containing children
		// TODO: Content should probably not return an array of things
		if (!content || content instanceof Array) {
			content = {
				constructor: 'framework/ui/dom/Element',
				html: '',
				children: content || []
			};
		}

		resolveAliases(content);
		return content;
	}

Content
	= nodes:(
		If
		/ For
		/ When
		/ Placeholder
		/ Data
		/ Alias
		/ Widget
		/ HtmlFragment
	)+ {
		// Flatten content into a single HTML string
		// with placeholder tags marking place for the template nodes.
		var isHtmlFragment = false,
			html = [],
			children = [];

		for (var i = 0, j = nodes.length; i < j; ++i) {
			var node = nodes[i];

			// An alias node will be transformed into a null node
			if (!node) {
				continue;
			}

			if (node.type === 'fragment') {
				isHtmlFragment = true;
				html.push(node.html);
			}
			else {
				html.push('<!-- child#' + children.length + ' -->');
				children.push(node);
			}
		}

		if (!isHtmlFragment) {
			return children;
		}

		return {
			constructor: 'framework/ui/dom/Element',
			html: html.join(''),
			children: children
		};
	}

HtmlFragment
	= content:(
		!(
			& OpenToken // Optimization: Only check tag rules when the current position matches the OpenToken
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
			/ Placeholder
			/ Data
			/ Alias
			/ WidgetTagOpen
			/ WidgetTagClose
		)
		character:. { return character; }
	)+ {
		return {
			type: 'fragment',
			html: content.join('')
		};
	}

If 'Widget'
	= ifNode:IfTagOpen
		content:Content?
		elseIfNodes:(
			elseIfNode:ElseIfTag
			content:Content? {
				elseIfNode.content = content;
				return elseIfNode;
			}
		)*
		elseContent:(ElseTag content:Content? { return content; })?
	IfTagClose {
		ifNode.content = content;

		// Combine 'if' and 'elseif' into ordered list of conditional blocks
		var conditionalBlocks = [ ifNode ];

		var elseIfNode;
		while ((elseIfNode = elseIfNodes.shift())) {
			conditionalBlocks.push(elseIfNode);
		}

		return {
			constructor: 'framework/templating/html/ui/Conditional',
			conditions: conditionalBlocks,
			alternate: elseContent
		};
	}

IfTagOpen 'Intermediate'
	= OpenToken 'if' attributes:AttributeMap CloseToken {
		validate(attributes, { required: [ 'condition' ] });
		return attributes;
	}

IfTagClose 'Null'
	= OpenToken '/if' CloseToken

ElseIfTag 'Intermediate'
	= OpenToken 'elseif' attributes:AttributeMap CloseToken {
		validate(attributes, { required: [ 'condition' ] });
		return attributes;
	}

ElseTag 'Null'
	= OpenToken 'else' CloseToken

For
	= attributes:ForTagOpen content:Content? ForTagClose {
		attributes.constructor = 'framework/templating/html/ui/Iterator';
		attributes.template = content;
		return attributes;
	}

ForTagOpen 'Intermediate'
	= OpenToken 'for' attributes:AttributeMap CloseToken {
		validate(attributes, { required: [ 'each', 'value' ] });
		return attributes;
	}

ForTagClose 'Null'
	= OpenToken '/for' CloseToken

When 'PromiseWidget'
	= whenNode:WhenTagOpen
		resolvedContent:Content?
		errorContent:(WhenErrorTag content:Content? { return content; })?
		progressContent:(WhenProgressTag content:Content? { return content; })?
	WhenTagClose {
		whenNode.resolvedContent = resolvedContent;
		whenNode.errorContent = errorContent;
		whenNode.progressContent = progressContent;
		return whenNode;
	}

WhenTagOpen 'Intermediate'
	= OpenToken 'when' attributes:AttributeMap CloseToken S* {
		validate(attributes, { required: [ 'promise' ], optional: [ 'value' ] });
		attributes.constructor = 'framework/templating/html/ui/Promise';
		return attributes;
	}

WhenTagClose 'Null'
	= OpenToken '/when' CloseToken

WhenErrorTag 'Null'
	= OpenToken 'error' CloseToken

WhenProgressTag 'Null'
	= OpenToken 'progress' CloseToken

Placeholder 'Intermediate'
	= OpenToken 'placeholder' attributes:AttributeMap CloseToken {
		validate(attributes, { required: [ 'name' ] });
		attributes.constructor = 'framework/templating/html/ui/Placeholder';
		return attributes;
	}

Data 'LabelWidget'
	= OpenToken 'data' attributes:AttributeMap CloseToken {
		validate(attributes, { required: [ 'var' ], optional: [ 'safe' ] });

		var label = {
			constructor: 'framework/ui/Widget!Label'
		};

		label[attributes.safe ? 'formattedText' : 'text'] = attributes['var'];
		return label;
	}

Alias 'Null'
	= OpenToken 'alias' attributes:AttributeMap CloseToken {
		validate(attributes, { required: [ 'from', 'to' ] });
		if (aliasMap[attributes.from]) {
			throw new Error('Alias "' + attributes.from + '" is already defined');
		}
		aliasMap[attributes.from] = attributes.to;
		return null;
	}

Widget 'Widget'
	= widgetNode:WidgetTagOpen content:Content? WidgetTagClose {
		widgetNode.children = content;
		return widgetNode;
	}

WidgetTagOpen 'Intermediate'
	= OpenToken 'widget' attributes:AttributeMap CloseToken {
		return attributes;
	}

WidgetTagClose 'Null'
	= OpenToken '/widget' CloseToken

AttributeMap
	= attributes:Attribute* S* {
		var attributeMap = {};
		for (var i = 0, attribute; (attribute = attributes[i]); ++i) {
			if (attribute.name === 'constructor') {
				throw new Error('"constructor" is a reserved attribute name');
			}

			if (attribute.name === 'is') {
				attribute.name = 'constructor';
			}

			if (hasOwnProperty.call(attributeMap, attribute.name)) {
				throw new Error('Duplicate attribute "' + attribute.name + '"');
			}

			attributeMap[attribute.name] = attribute.value == null ? true : attribute.value;
		}

		return attributeMap;
	}

Attribute
	= S+ name:AttributeName value:(S* '=' S* value:AttributeValue { return value; })? {
		return { name: name, value: value };
	}

AttributeName
	= nameChars:[a-zA-Z\-]+ { return nameChars.join(''); }

AttributeValue
	= ("'" value:("\\'" { return "'"; } / [^'\r\n])* "'" { return value.join(''); })
	/ ('"' value:('\\"' { return '"'; } / [^"\r\n])* '"' { return value.join(''); })

OpenToken
	= '<' S*

CloseToken
	= S* '>'

S 'whitespace'
	= [ \t\r\n]

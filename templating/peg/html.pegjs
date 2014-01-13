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
				error('Missing required attribute "' + required[i] + '" on' + type + ' node');
			}
		}

		if (!rules.allowAnyAttribute) {
			for (var name in attributes) {
				if (!(name in permitted)) {
					error('Invalid attribute "' + name + '" on' + type + ' node');
				}
			}
		}
	}

	/**
	 * Walks the widget tree, resolving constructor aliases for the given node and its children.
	 */
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

	/**
	 * A map of constructor names, where the key is the unexpanded source and the value is the expanded destination.
	 * Aliases are currently resolved in the order in which they are received, not by longest to shortest.
	 * TODO: Longest to shortest, and delimited by slashes, would probably be a good idea.
	 */
	var aliasMap = {};
}

// template root

Template
	// TODO: This fails to fall through to Element if AnyNonElement matches when it sees more data instead of EOF.
	= root:Any? {
		if (!root) {
			root = {
				constructor: 'framework/ui/dom/Element',
				html: '',
				children: []
			};
		}

		resolveAliases(root);
		return root;
	}

// collections

Any
	= AnyNonElement
	/ Element

AnyNonElement
	= If
	/ For
	/ When
	/ Placeholder
	/ Data
	/ Alias
	/ Widget

// HTML

Element 'HTML'
	= content:(
		AnyNonElement
		/ HtmlFragment
	)+ {
		var html = '',
			children = [];

		for (var i = 0, j = content.length; i < j; ++i) {
			var node = content[i];

			// An alias node will be transformed into a null node
			if (!node) {
				continue;
			}

			if (typeof node === 'string') {
				html += node;
			}
			else {
				html += '<!-- child#' + children.length + ' -->';
				children.push(node);
			}
		}

		return {
			constructor: 'framework/ui/dom/Element',
			html: html,
			children: children
		};
	}

HtmlFragment 'HTML'
	= content:(
		// TODO: Not sure how valid these exclusions are
		!(
			// Optimization: Only check tag rules when the current position matches the OpenToken
			& OpenToken

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
			// Alias rule has side-effects
			/ (OpenToken 'alias' AttributeMap CloseToken)
			/ WidgetTagOpen
			/ WidgetTagClose
		)
		character:. { return character; }
	)+ {
		return content.join('');
	}

// conditionals

If '<if>'
	= conditional:IfTagOpen
	consequent:Any
	alternates:(
		alternate:ElseIfTag
		consequent:Any {
			alternate.content = consequent;
			return alternate;
		}
	)*
	alternate:(OpenToken 'else' CloseToken content:Any { return content; })?
	IfTagClose {
		conditional.content = consequent;

		return {
			constructor: 'framework/templating/html/ui/Conditional',
			conditions: [ conditional ].concat(alternates),
			alternate: alternate
		};
	}

IfTagOpen '<if>'
	= OpenToken 'if' attributes:AttributeMap CloseToken {
		validate(attributes, { required: [ 'condition' ] });
		return attributes;
	}

IfTagClose '</if>'
	= OpenToken '/if' CloseToken

ElseIfTag '<elseif>'
	= OpenToken 'elseif' attributes:AttributeMap CloseToken {
		validate(attributes, { required: [ 'condition' ] });
		return attributes;
	}

ElseTag '<else>'
	= OpenToken 'else' CloseToken

// loops

For '<for>'
	= forWidget:ForTagOpen template:Any ForTagClose {
		forWidget.constructor = 'framework/templating/html/ui/Iterator';
		forWidget.template = template;
		return forWidget;
	}

ForTagOpen '<for>'
	= OpenToken 'for' attributes:AttributeMap CloseToken {
		validate(attributes, { required: [ 'each', 'value' ] });
		return attributes;
	}

ForTagClose '</for>'
	= OpenToken '/for' CloseToken

// promises

When '<when>'
	= when:WhenTagOpen
	resolved:Any?
	error:(WhenErrorTag content:Any? { return content; })?
	progress:(WhenProgressTag content:Any? { return content; })?
	WhenTagClose {
		when.constructor = 'framework/templating/html/ui/When';
		when.resolved = resolved;
		when.error = error;
		when.progress = progress;
		return when;
	}

WhenTagOpen '<when>'
	= OpenToken 'when' attributes:AttributeMap CloseToken S* {
		validate(attributes, { required: [ 'promise' ], optional: [ 'value' ] });
		return attributes;
	}

WhenTagClose '</when>'
	= OpenToken '/when' CloseToken

WhenErrorTag '<error>'
	= OpenToken 'error' CloseToken

WhenProgressTag '<progress>'
	= OpenToken 'progress' CloseToken

// widgets

Widget '<widget>'
	= widget:WidgetTagOpen children:(Any)* WidgetTagClose {
		widget.constructor = widget.is;
		delete widget.is;

		widget.children = children;
		return widget;
	}

WidgetTagOpen '<widget>'
	= OpenToken 'widget' attributes:AttributeMap CloseToken {
		validate(attributes, { required: [ 'is' ], allowAnyAttribute: true });
		return attributes;
	}

WidgetTagClose '</widget>'
	= OpenToken '/widget' CloseToken

// all others

Placeholder '<placeholder>'
	= OpenToken 'placeholder' placeholder:AttributeMap CloseToken {
		validate(placeholder, { required: [ 'name' ] });
		placeholder.constructor = 'framework/templating/html/ui/Placeholder';
		return placeholder;
	}

Data '<data>'
	= OpenToken 'data' attributes:AttributeMap CloseToken {
		validate(attributes, { required: [ 'var' ], optional: [ 'safe' ] });

		var label = {
			constructor: 'framework/ui/Widget!Label'
		};

		label[attributes.safe ? 'formattedText' : 'text'] = attributes['var'];
		return label;
	}

Alias '<alias>'
	= OpenToken 'alias' attributes:AttributeMap CloseToken {
		validate(attributes, { required: [ 'from', 'to' ] });
		if (aliasMap[attributes.from]) {
			error('Alias "' + attributes.from + '" is already defined');
		}
		aliasMap[attributes.from] = attributes.to;
		return null;
	}

// attributes

AttributeMap
	= attributes:Attribute* S* {
		var attributeMap = {};
		for (var i = 0, attribute; (attribute = attributes[i]); ++i) {
			if (attribute.name === 'constructor') {
				error('"constructor" is a reserved attribute name');
			}

			if (Object.prototype.hasOwnProperty.call(attributeMap, attribute.name)) {
				error('Duplicate attribute "' + attribute.name + '"');
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

// miscellaneous

OpenToken '<'
	= '<' S*

CloseToken '>'
	= S* '>'

S 'whitespace'
	= [ \t\r\n]

{
	/**
	 * Validates that the attributes provided in the given attribute map are correct according to the provided rules.
	 */
	function validate(attributes, rules) {
		var required = rules.required || [],
			type = rules.type ? ' on ' + rules.type : '';

		for (var i = 0; i < required.length; ++i) {
			if (!(required[i] in attributes)) {
				error('Missing required attribute "' + required[i] + '"' + type);
			}
		}

		if (!rules.constructable && 'is' in attributes) {
			error('Constructor is not allowed' + type);
		}
	}

	function parseBoundText(text) {
		var results = parse(text, { startRule: 'BoundText' });
		// Loop over results list and inspect for binding objects
		for (var i = 0, l = results.length; i < l; ++i) {
			if (results[i].binding) {
				// Return as binding object if only one item
				return l === 1 ? results[0] : results;
			}
		}
		// If no bindings in array flatten into a string
		return results.join('');
	}
}

// template root

Template
	= root:(
		// A non-element followed by anything other than EOF should be considered a child of a root Element widget,
		// otherwise the parser fails on whatever follows. Changing this to capture zero or more Any tokens would
		// require modification to Template to special-case n = 1, which is unpleasant, and also generate a wacky tree
		// where the first widget is the first widget and then the second widget is an Element widget containing all
		// the rest of the widgets
		(widget:AnyNonElement !. { return widget; })
		/ Element
	)? {
		if (!root) {
			root = {
				constructor: null,
				html: '',
				children: []
			};
		}

		// Collapse root w/ no content and 1 child widget to child
		var children = root.children || [];
		if (children.length === 1 && root.html === null) {
			root = children[0];
		}
		return root;
	}

// HTML

Element 'HTML'
	= content:(
		AnyNonElement
		/ HtmlFragment
	)+ {
		var html = '',
			element = {
				constructor: null,
				children: []
			},
			children = element.children,
			nonWhitespace = /\S/,
			hasText = false;

		for (var i = 0, j = content.length; i < j; ++i) {
			var node = content[i];

			// Ignore null nodes
			if (!node) {
				continue;
			}

			if (typeof node === 'string') {
				html += node;
				hasText || (hasText = nonWhitespace.test(node));
			}
			else {
				html += '<!-- child#' + children.length + ' -->';
				children.push(node);
			}
		}

		// If Element is just children and whitespace null out html as a signal to collapse it
		element.html = hasText || !children.length ? parseBoundText(html) : null;
		return element;
	}

HtmlFragment 'HTML'
	= content:(
		// TODO: Not sure how valid these exclusions are
		!(
			// Optimization: Only check tag rules when the current position matches the tag opening token
			// TODO: soon we should only have to check on `'<' CustomElementTagName`
			& '<'

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
			/ WidgetTagOpen
			/ WidgetTagClose
			/ WidgetNoChildren
			/ CustomElementTagOpen
			/ CustomElementTagClose
			/ CustomElementNoChildren
		)
		character:. { return character; }
	)+ {
		return content.join('');
	}

BoundText
	// Curly brackets inside the actions needs to be escaped due to https://github.com/dmajda/pegjs/issues/89
	= (
		'{' value:('\\}' { return '\x7d'; } / [^}])* '}' { return { binding: value.join('') }; }
		/ !'{' value:('\\{' { return '\x7b'; } / [^{])+ { return value.join(''); }
	)*

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
	alternate:(ElseTag content:Any { return content; })?
	IfTagClose {
		conditional.content = consequent;

		return {
			constructor: 'framework/templating/html/ui/Conditional',
			conditions: [ conditional ].concat(alternates),
			alternate: alternate
		};
	}

IfTagOpen '<if>'
	= '<' 'if'i attributes:AttributeMap '>' {
		validate(attributes, { type: '<if>', required: [ 'condition' ] });
		return attributes;
	}

IfTagClose '</if>'
	= '</if>'i

ElseIfTag '<elseif>'
	= '<' 'elseif'i attributes:AttributeMap '>' {
		validate(attributes, { type: '<elseif>', required: [ 'condition' ] });
		return attributes;
	}

ElseTag '<else>'
	= '<else>'

// loops

For '<for>'
	= forWidget:ForTagOpen template:Any ForTagClose {
		forWidget.constructor = 'framework/templating/html/ui/Iterator';
		forWidget.template = template;
		return forWidget;
	}

ForTagOpen '<for>'
	= '<for'i attributes:AttributeMap '>' {
		validate(attributes, { type: '<for>', required: [ 'each', 'in' ] });
		return attributes;
	}

ForTagClose '</for>'
	= '</for>'i

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
	= '<when'i attributes:AttributeMap '>' S* {
		validate(attributes, { type: '<when>', required: [ 'promise' ], optional: [ 'value' ] });
		return attributes;
	}

WhenTagClose '</when>'
	= '</when>'i

WhenErrorTag '<error>'
	= '<error>'i

WhenProgressTag '<progress>'
	= '<progress>'i

// widgets

Widget '<widget...>'
	= widget:WidgetTagOpen children:(Any)* WidgetTagClose {
		widget.constructor = widget.is;
		delete widget.is;

		// Collapse single Element child w/ no content
		if (children.length === 1 && children[0].html === null) {
			widget.children = children[0].children;
		}
		else {
			widget.children = children;
		}
		return widget;
	}

WidgetTagOpen '<widget>'
	= '<widget'i attributes:AttributeMap '>' {
		validate(attributes, { type: '<widget>', required: [ 'is' ], constructable: true });
		return attributes;
	}

WidgetTagClose '</widget>'
	= '</widget>'i

WidgetNoChildren '<widget/>'
	= '<widget'i widget:AttributeMap '/>' {
		validate(widget, { type: '<widget>', required: [ 'is' ], constructable: true });
		widget.constructor = widget.is;
		delete widget.is;
		return widget;
	}

CustomElement '<custom-element...>'
	= element:CustomElementTagOpen children:(Any)* (endTag:CustomElementTagClose & {
		return element.tagName.toLowerCase() === endTag.toLowerCase();
	}) {
		element.constructor = null;
		element.children = children;
		return element;
	}

CustomElementTagOpen '<custom-element>'
	= '<' tagName:CustomElementTagName element:AttributeMap '>' {
		validate(element, { type: '<custom-element>' });
		element.tagName = tagName;
		return element;
	}

CustomElementTagName
	= head:[a-zA-Z]+ '-' tail:[a-zA-Z\-]* {
		return head.concat('-').concat(tail).join('');
	}

CustomElementTagClose '</custom-element>'
	= '</' tagName:CustomElementTagName '>' {
		return tagName;
	}

CustomElementNoChildren '<custom-element/>'
	= '<' tagName:CustomElementTagName element:AttributeMap '/>' {
		validate(element, { type: '<custom-element>' });
		element.constructor = null;
		element.tagName = tagName;
		return element;
	}

// all others

Placeholder '<placeholder>'
	= '<placeholder'i placeholder:AttributeMap '>' {
		validate(placeholder, { type: '<placeholder>', required: [ 'name' ] });
		placeholder.constructor = 'framework/templating/html/ui/Placeholder';
		return placeholder;
	}

// attributes

AttributeMap
	= attributes:Attribute* S* {
		var attributeMap = {};
		for (var i = 0, attribute; (attribute = attributes[i]); ++i) {
			// TODO: allow 'constructor' for Widget only
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
	= S+ name:$(AttributeName) value:(S* '=' S* value:AttributeValue { return value; })? {
		return { name: name, value: value };
	}

AttributeName
	= nameChars:[a-zA-Z\-]+

AttributeValue
	= ("'" value:("\\'" { return "'"; } / [^'\r\n])* "'" { return parseBoundText(value.join('')); })
	/ ('"' value:('\\"' { return '"'; } / [^"\r\n])* '"' { return parseBoundText(value.join('')); })

// miscellaneous

Any
	= AnyNonElement
	/ Element

AnyNonElement
	= If
	/ For
	/ When
	/ Placeholder
	/ Widget
	/ WidgetNoChildren
	/ CustomElement
	/ CustomElementNoChildren

S 'whitespace'
	= [ \t\r\n]

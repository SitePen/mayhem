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
		for (var i = 0, len = results.length; i < len; ++i) {
			if (results[i].binding) {
				// Flatten binding template if only one item
				return { binding: len === 1 ? results[0].binding : results };
			}
		}
		// If no bindings in array flatten into a string
		// TODO: should we generate an error instead?
		return results.join('');
	}

	var aliases = {
		_aliases: [],
		_map: null,

		/**
		 * Adds a new alias to the alias list for this template.
		 *
		 * @param newAlias {Object}
		 * An object with the following keys:
		 *   * `from` (string): The module ID fragment to replace.
		 *   * `to` (string): The replacement module ID fragment.
		 *   * `line` (number): The one-indexed line number where the alias was defined in the template.
		 *   * `column` (number): The one-indexed column number where the alias was defined in the template.
		 */
		add: function (newAlias) {
			var aliases = this._aliases;

			// Ensure that aliases are limited to complete module ID fragments
			newAlias.from = newAlias.from.toString().replace(/\/*$/, '/');
			newAlias.to = newAlias.to.toString().replace(/\/*$/, '/');

			for (var i = 0, oldAlias; (oldAlias = aliases[i]); ++i) {
				// The same alias has already been parsed once before, probably by some look-ahead; do not add it
				// again
				if (oldAlias.line === newAlias.line && oldAlias.column === newAlias.column) {
					return;
				}

				// Aliases are ordered and applied by length, then by entry order if the lengths are identical
				if (oldAlias.from.length < newAlias.from.length) {
					break;
				}
			}

			aliases.splice(i, 0, newAlias);
		},

		/**
		 * Walks the widget tree, resolving constructor aliases for the given node and its children.
		 */
		resolve: function (node) {
			var aliasMap = this._map;

			for (var k in aliasMap) {
				if (node.constructor.indexOf(k) === 0) {
					node.constructor = node.constructor.replace(k, aliasMap[k].to);
				}
			}

			if (node.children && node.children.length) {
				for (var i = 0, child; (child = node.children[i]); ++i) {
					this.resolve(child);
				}
			}
		},

		/**
		 * Validates that the collected aliases from the template are valid and do not contain duplicate definitions.
		 */
		validate: function () {
			var aliases = this._aliases,
				aliasMap = {};

			for (var i = 0, alias; (alias = aliases[i]); ++i) {
				if (aliasMap[alias.from]) {
					var oldAlias = aliasMap[alias.from];
					throw new Error('Line ' + alias.line + ', column ' + alias.column + ': Alias "' + alias.from +
						'" was already defined at line ' + oldAlias.line + ', column ' + oldAlias.column);
				}

				aliasMap[alias.from] = alias;
			}

			this._map = aliasMap;
		}
	};
}

// template root

Template
	= root:(
		// A non-element followed by anything other than EOF should be considered a child of a root Element widget,
		// otherwise the parser fails on whatever follows. Changing this to capture zero or more Any tokens would
		// require modification to Template to special-case n = 1, which is unpleasant, and also generate a wacky tree
		// where the first widget is the first widget and then the second widget is an Element widget containing all
		// the rest of the widgets
		(widget:AnyNonElement !. { return widget })
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

		aliases.validate();
		aliases.resolve(root);
		return root;
	}

// HTML

Element 'HTML'
	= items:(
		AnyNonElement
		/ HtmlFragment
	)+ {
		var content = [],
			element = {
				constructor: null,
				children: []
			},
			children = element.children,
			nonWhitespace = /\S/,
			hasText = false;

		for (var i = 0, j = items.length; i < j; ++i) {
			var node = items[i];

			// An alias node will be transformed into a null node
			if (!node) {
				continue;
			}

			if (typeof node === 'string') {
				content.push(node);
				hasText || (hasText = nonWhitespace.test(node))
			}
			else {
				content.push({ child: children.length });
				children.push(node);
			}
		}

		if (children.length && !hasText) {
			// If Element is just children and whitespace null out html as a signal to collapse it
			element.html = null;
			return element;
		}
		if (content.length === 1 && typeof content[0] === 'string') {
			// Flatten to string if content is just a single string in an array
			element.html = content[0];
			return element;
		}
		// Parse the string portions of our html template for text bindings
		var results = [],
			item,
			parsed;
		for (var i = 0, len = content.length; i < len; ++i) {
			item = content[i];
			if (typeof item === 'string') {
				parsed = parseBoundText(item);
				// TODO: clean this up
				if (parsed.binding) {
					results = results.concat(parsed.binding);
				}
				else {
					results.push(parsed);
				}
			}
			else {
				results.push(item);
			}
		}
		element.html = results;
		return element;
	}

HtmlFragment 'HTML'
	= content:(
		// TODO: Not sure how valid these exclusions are
		!(
			// Optimization: Only check tag rules when the current position matches the tag opening token
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
			/ Alias
			/ WidgetTagOpen
			/ WidgetTagClose
			/ WidgetNoChildren
		)
		character:. { return character }
	)+ {
		return content.join('');
	}

BoundText
	// Curly brackets inside the actions needs to be escaped due to https://github.com/dmajda/pegjs/issues/89
	= (
		'{' value:('\\}' { return '\x7d' } / [^}])* '}' { return { binding: value.join('') } }
		/ !'{' value:('\\{' { return '\x7b' } / [^{])+ { return value.join('') }
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
	alternate:(ElseTag content:Any { return content })?
	IfTagClose {
		conditional.content = consequent;

		return {
			constructor: 'framework/templating/html/Conditional',
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

For '<for...>'
	= forWidget:ForTagOpen template:Any ForTagClose {
		forWidget.constructor = 'framework/templating/html/Iterator';
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
	error:(WhenErrorTag content:Any? { return content })?
	progress:(WhenProgressTag content:Any? { return content })?
	WhenTagClose {
		when.constructor = 'framework/templating/html/When';
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

// all others

Placeholder '<placeholder>'
	= '<placeholder'i placeholder:AttributeMap '>' {
		validate(placeholder, { type: '<placeholder>', required: [ 'name' ] });
		placeholder.constructor = 'framework/templating/html/Placeholder';
		return placeholder;
		// TODO: return { named: attribute.name };
	}

Alias '<alias>'
	= '<alias'i alias:AttributeMap '>' {
		validate(alias, { type: '<alias>', required: [ 'from', 'to' ] });
		alias.line = line();
		alias.column = column();
		aliases.add(alias);
		return null;
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

			attributeMap[attribute.name] = attribute.value;
		}

		return attributeMap;
	}

Attribute
	= S+ name:AttributeName value:(S* '=' S* value:AttributeValue {
		// We have to invert null and undefined here to disambiguate a null return from JSONAttributeValue
		return value === null ? undefined : value;
	})? {
		// Treat attributes without values as true
		if (value === null) {
			return { name: name, value: true };
		}
		// Treat undefined as null since we inverted it earlier
		return { name: name, value: value === undefined ? null : value };
	}

AttributeName
	= nameChars:[a-zA-Z\-]+ {
		return nameChars.join('').toLowerCase().replace(/-([a-z])/, function () {
			return arguments[1].toUpperCase();
		});
	}

// Attribute values can be JSON or single-quoted strings which are parsed for curly-quoted bindings

AttributeValue
	= StringAttributeValue
	/ JSONAttributeValue

StringAttributeValue
	= ("'" value:("\\'" { return "'" } / [^'\r\n])* "'" { return parseBoundText(value.join('')) })
	/ ('"' value:('\\"' { return '"'; } / [^"\r\n])* '"' { return parseBoundText(value.join('')); })

JSONAttributeValue "json"
	= S* value:JSONValue { return value }

// JSON parser adapted from PEG.js example

JSONObject
	= "{" S* "}" S* { return {} }
	/ "{" S* members:JSONMembers "}" S* { return members }

JSONMembers
	= head:JSONPair tail:("," S* JSONPair)* {
      var result = {};
      result[head[0]] = head[1];
      for (var i = 0; i < tail.length; i++) {
        result[tail[i][2][0]] = tail[i][2][1];
      }
      return result;
    }

JSONPair
	= name:JSONString ":" S* value:JSONValue { return [name, value] }

JSONArray
	= "[" S* "]" S* { return [] }
	/ "[" S* elements:JSONElements "]" S* { return elements }

JSONElements
	= head:JSONValue tail:("," S* JSONValue)* {
      var result = [head];
      for (var i = 0, l = tail.length; i < l; ++i) {
        result.push(tail[i][2]);
      }
      return result;
    }

JSONValue
	= JSONLiteral
	/ JSONObject
	/ JSONArray

JSONLiteral
	= JSONString
	/ JSONNumber
	/ JSONTrue
	/ JSONFalse
	/ JSONNull

JSONTrue "true"
	= "true" S* { return true }

JSONFalse "false"
	= "false" S* { return false }

JSONNull "null"
	= "null" S* { return null }

// JSON lexical elements

JSONString "string"
	= '"' '"' S* { return "" }
	/ '"' chars:JSONChars '"' S* { return chars }

JSONChars
	= chars:JSONChar+ { return chars.join("") }

JSONChar
  // In the original JSON grammar: "any-Unicode-character-except-"-or-\-or-control-character"
	= [^"\\\0-\x1F\x7f]
	/ '\\"' { return '"' }
	/ "\\\\" { return "\\" }
	/ "\\/" { return "/"  }
	/ "\\b" { return "\b" }
	/ "\\f" { return "\f" }
	/ "\\n" { return "\n" }
	/ "\\r" { return "\r" }
	/ "\\t" { return "\t" }
	/ "\\u" digits:$(HexDigit HexDigit HexDigit HexDigit) { return String.fromCharCode(parseInt(digits, 16)) }

JSONNumber "number"
	= parts:$(JSONInteger JSONFraction JSONExponent) S* { return parseFloat(parts) }
	/ parts:$(JSONInteger JSONFraction) S* { return parseFloat(parts) }
	/ parts:$(JSONInteger JSONExponent) S* { return parseFloat(parts) }
	/ parts:$(JSONInteger) S* { return parseFloat(parts) }

JSONInteger
	= Digit19 Digits
	/ Digit
	/ "-" Digit19 Digits
	/ "-" Digit

JSONFraction
	= "." Digits

JSONExponent
	= E Digits

Digits
	= Digit+

Digit
	= [0-9]

Digit19
	= [1-9]

HexDigit
	= [0-9a-fA-F]

E
	= [eE] [+-]?

// miscellaneous

Any
	= AnyNonElement
	/ Element

AnyNonElement
	= If
	/ For
	/ When
	/ Placeholder
	/ Alias
	/ Widget
	/ WidgetNoChildren

S "whitespace"
	= [ \t\r\n]

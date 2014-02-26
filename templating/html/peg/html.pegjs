{
	/**
	 * Validates that the attributes provided in the given attribute map are correct according to the provided rules.
	 */
	 function validate(attributes, rules) {
		var required = rules.required || [],
			optional = rules.optional || [],
			type = rules.type ? ' on ' + rules.type : '';

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
				error('Missing required attribute "' + required[i] + '"' + type);
			}
		}

		if (!rules.extensible) {
			for (var name in attributes) {
				if (!(name in permitted)) {
					error('Invalid attribute "' + name + '"' + type);
				}
			}
		}

		var idType = typeof attributes.id;
		if (idType !== 'undefined' && idType !== 'string') {
			error('Invalid "id" attribute type: ' + idType);
		}
	}

	function parseBoundText(text) {
		var results = parse(text, { startRule: 'BoundText' });
		// Loop over results list and inspect for binding objects
		for (var i = 0, len = results.length; i < len; ++i) {
			if (results[i].$bind) {
				// Flatten binding template if only one item
				return { $bind: len === 1 ? results[0].$bind : results };
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
				constructor: '',
				content: '',
				children: []
			};
		}

		// Collapse root w/ no content and 1 child widget to child
		var children = root.children || [];
		if (children.length === 1 && root.content === null) {
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
				constructor: '',
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
			else if (node.$named) {
				content.push(node)
			}
			else {
				content.push({ $child: children.length });
				children.push(node);
			}
		}

		if (children.length && !hasText) {
			// If Element is just children and whitespace null out content as a signal to collapse it
			element.content = null;
			return element;
		}
		if (content.length === 1 && typeof content[0] === 'string') {
			// Flatten to string if content is just a single string in an array
			element.content = content[0];
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
				if (parsed.$bind) {
					results = results.concat(parsed.$bind);
				}
				else {
					results.push(parsed);
				}
			}
			else {
				results.push(item);
			}
		}
		element.content = results;
		return element;
	}

HtmlFragment 'HTML'
	= content:(
		// TODO: Not sure how valid these exclusions are
		!(
			// Optimization: Only check tag rules when the current position matches the tag opening token
			& '<'

			IfTagOpen
			/ IfTagClose
			/ ElseIfTagOpen
			/ ElseIfTagClose
			/ ElseTagOpen
			/ ElseTagClose
			/ ForTagOpen
			/ ForTagClose
			/ WhenTagOpen
			/ WhenTagClose
			/ ErrorTagOpen
			/ DuringTagOpen
			/ DuringTagClose
			/ ErrorTagClose
			/ Placeholder
			/ Alias
			/ WidgetNoContent
			/ WidgetTagOpen
			/ WidgetTagClose
		)
		character:. { return character }
	)+ {
		return content.join('');
	}

BoundText
	// Curly brackets inside the actions needs to be escaped due to https://github.com/dmajda/pegjs/issues/89
	= (
		'{' value:('\\}' { return '\x7d' } / [^}])* '}' { return { $bind: value.join('') } }
		/ !'{' value:('\\{' { return '\x7b' } / [^{])+ { return value.join('') }
	)*

// conditionals

If '<if/>'
	= kwArgs:IfTagOpen
	content:Any
	alternates:(
		alternate:ElseIfTagOpen consequent:Any (ElseIfTagClose S*)? {
			return {
				kwArgs: alternate,
				content: consequent
			};
		}
	)*
	finalAlternate:(kwArgs:ElseTagOpen content:Any (ElseTagClose S*)? {
		return {
			constructor: '',
			kwArgs: kwArgs,
			content: content
		};
	})?
	IfTagClose {
		var conditional = {
			constructor: 'framework/templating/html/ui/Conditional',
			kwArgs: kwArgs,
			content: content
		};

		// Loop over our alternates and turn them into a recursive list of conditional widgets
		var target = conditional, i, alternate;
		for (i = 0; (alternate = alternates[i]); ++i) {
			alternate.constructor = conditional.constructor;
			target = target.kwArgs.alternate = alternate;
		}
		if (finalAlternate) {
			target.kwArgs.alternate = finalAlternate;
		}
		return conditional;
	}

IfTagOpen '<if>'
	= '<if'i kwArgs:AttributeMap '>' {
		validate(kwArgs, {
			type: '<if>',
			required: [ 'condition' ],
			optional: [ 'id' ]
		});
		return kwArgs;
	}

IfTagClose '</if>'
	= '</if>'i

ElseIfTagOpen '<elseif>'
	= '<elseif'i kwArgs:AttributeMap '>' {
		validate(kwArgs, {
			type: '<elseif>',
			required: [ 'condition' ],
			optional: [ 'id' ]
		});
		return kwArgs;
	}

ElseIfTagClose '</elseif>'
	= '</elseif>'i

ElseTagOpen '<else>'
	= '<else'i kwArgs:AttributeMap '>' {
		validate(kwArgs, {
			type: '<else>',
			optional: [ 'id' ]
		});
		return kwArgs;
	}

ElseTagClose '</else>'
	= '</else>'i

// loops

For '<for/>'
	= kwArgs:ForTagOpen template:Any ForTagClose {
		validate(kwArgs, {
			type: '<for>',
			required: [ 'each', 'in' ],
			optional: [ 'index', 'id' ]
		});
		// Wrap template with an array to keep it from being instantiated by processor
		kwArgs.template = [ template ];
		return {
			constructor: 'framework/templating/html/ui/Iterator',
			kwArgs: kwArgs
		};
	}

ForTagOpen '<for>'
	= '<for'i kwArgs:AttributeMap '>' { return kwArgs }

ForTagClose '</for>'
	= '</for>'i

// promises

When '<when/>'
	= kwArgs:WhenTagOpen
	widget:Any?
	during:(DuringTagOpen content:Any? (DuringTagClose S*)? { return content })?
	error:(ErrorTagOpen content:Any? (ErrorTagClose S*)? { return content })?
	WhenTagClose {
		// TODO: process bindings within content, and wihtin during and error widgets
		kwArgs.during = during;
		kwArgs.error = error;
		widget.kwArgs = kwArgs;
		widget.constructor = 'framework/templating/html/ui/When';
		return widget;
	}

WhenTagOpen '<when>'
	= '<when'i kwArgs:AttributeMap '>' S* {
		validate(kwArgs, {
			type: '<when>',
			required: [ 'promise' ],
			optional: [ 'value', 'id' ]
		});
		return kwArgs;
	}

WhenTagClose '</when>'
	= '</when>'i

DuringTagOpen '<during>'
	= '<during'i kwArgs:AttributeMap '>' S* {
		validate(kwArgs, {
			type: '<during>',
			optional: [ 'id' ]
		});
		return {
			constructor: '',
			kwArgs: kwArgs
		};
	}

DuringTagClose '</during>'
	= '</during>'i

ErrorTagOpen '<error>'
	= '<error'i kwArgs:AttributeMap '>' S* {
		validate(kwArgs, {
			type: '<error>',
			optional: [ 'id' ]
		});
		return {
			constructor: '',
			kwArgs: kwArgs
		};
	}

ErrorTagClose '</error>'
	= '</error>'i

// widgets


Widget '<widget></widget>'
	= widget:(WidgetNoContent / WidgetWithContent) {
		var kwArgs = widget.kwArgs,
			children = widget.children;
		validate(kwArgs, {
			type: '<widget>',
			required: [ 'is' ],
			extensible: true
		});

		var ctor = widget.constructor = kwArgs.is;
		if (typeof ctor !== 'string') {
			error('Widget constructor ' + ctor + ' must be a string');
		}
		delete kwArgs.is;

		// Collapse single Element child w/ no content
		if (children && children.length === 1 && children[0].content === null) {
			children = widget.children = children[0].children;
		}

		// Resolve any attribute reference functions with widget children
		var value;
		for (var key in kwArgs) {
			value = kwArgs[key];
			if (typeof value === 'function') {
				kwArgs[key] = value(children);
			}
		}

		return widget;
	}

WidgetWithContent '<widget>'
	= kwArgs:WidgetTagOpen children:(Any)* WidgetTagClose {
		return { kwArgs: kwArgs, children: children };
	};

WidgetTagOpen '<widget>'
	= '<widget'i kwArgs:AttributeMap '>' { return kwArgs }

WidgetTagClose '</widget>'
	= '</widget>'i

WidgetNoContent '<widget/>'
	= '<widget'i kwArgs:AttributeMap '/>' { return { kwArgs: kwArgs } }

// actions

// Action '<action/>'
//	= '<action'i 

// all others

Placeholder '<placeholder/>'
	= '<placeholder'i kwArgs:AttributeMap '/'? '>' {
		validate(kwArgs, {
			type: '<placeholder>',
			required: [ 'name' ]
		});
		// return just another marker object (like $bind and $child)
		return { $named: kwArgs.name };
	}

Alias '<alias/>'
	= '<alias'i alias:AttributeMap '/'? '>' {
		validate(alias, {
			type: '<alias>',
			required: [ 'from', 'to' ]
		});
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
			if (Object.prototype.hasOwnProperty.call(attributeMap, attribute.name)) {
				error('Duplicate attribute "' + attribute.name + '"');
			}

			attributeMap[attribute.name] = attribute.value;
		}
		return attributeMap;
	}

Attribute
	= S+ name:AttributeName value:(S* '=' S* value:AttributeValue {
		// We have to invert null and undefined here to disambiguate empty attributes from JSONValue null
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
	= AttributeReferenceValue
	/ AttributeStringValue
	/ JSONValue
	/ BoundText

AttributeReferenceValue
	= '#' id:Identifier {
		// Returns a function to resolve a child given a children array
		return function resolve(children) {
			// TODO: recurse for ids?
			var child;
			for (var i = 0, len = children.length; i < len; ++i) {
				child = children[i];
				if (child && child.kwArgs && child.kwArgs.id === id) {
					// null out child since it's no longer part of content
					children[i] = null;
					return child;
				}
			}
			error('Referenced child id "' + id + '" not found');
		};
	}

// Identifiers per HTML
Identifier
	= $([A-Za-z] [A-Za-z0-9\-_\:\.]*)

AttributeStringValue
	= ("'" value:("\\'" { return "'" } / [^'\r\n])* "'" { return parseBoundText(value.join('')) })
	/ ('"' value:('\\"' { return '"'; } / [^"\r\n])* '"' { return parseBoundText(value.join('')); })

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
      for (var i = 0, len = tail.length; i < len; ++i) {
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
	/ WidgetNoContent

S "whitespace"
	= [ \t\r\n]

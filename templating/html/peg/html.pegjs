{
	var concat = Array.prototype.concat;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var getKeys = function (object) {
		var keys = [];
		for (var key in object) {
			keys.push(key);
		}
		return keys;
	};
	var toAbsMid = require.toAbsMid || function (mid) {
		// From Dojo 2 core
		function compactPath(path) {
			var result = [];
			var segment;
			var lastSegment;
			var splitPath = path.replace(/\\/g, '/').split('/');

			while (splitPath.length) {
				segment = splitPath.shift();
				if (segment === '..' && result.length && lastSegment !== '..') {
					result.pop();
					lastSegment = result[result.length - 1];
				}
				else if (segment !== '.') {
					result.push((lastSegment = segment));
				} // else ignore "."
			}

			return result.join('/');
		}

		if (mid.charAt(0) !== '.') {
			return mid;
		}

		return compactPath(module.id.replace(/[^\/]*\.js$/, '') + mid);
	};

	/**
	 * Validates that the attributes provided in the given attribute map are correct according to the provided rules.
	 */
	function validate(attributes, rules) {
		var required = rules.required || [];
		var optional = rules.optional || [];
		var type = rules.type ? ' on ' + rules.type : '';

		var i = 0;
		var j = 0;
		var permitted = {};

		for (i = 0, j = required.length; i < j; ++i) {
			if (!hasOwnProperty.call(attributes, required[i])) {
				throwError('Missing required attribute "' + required[i] + '"' + type);
			}
			permitted[required[i]] = true;
		}

		for (i = 0, j = optional.length; i < j; ++i) {
			permitted[optional[i]] = true;
		}

		if (!rules.extensible) {
			for (var name in attributes) {
				if (!hasOwnProperty.call(permitted, name)) {
					throwError('Invalid attribute "' + name + '"' + type);
				}
			}
		}
	}

	/**
	 * Parses `text` for data binding signatures.
	 *
	 * @param {string} text Text possibly containing data binding signatures.
	 * @returns {{ $bind: string[] }|string} A binding instruction object if data binding paths exist in the text, or
	 * just the text if there were no data binding signatures.
	 */
	function parseBoundText(text) {
		var results = parse(text, { startRule: 'BoundText' });

		for (var i = 0, j = results.length; i < j; ++i) {
			if (results[i].$bind) {
				if (results.length === 1) {
					return results[i];
				}

				return { $bind: results, direction: 1 };
			}
		}

		return results.join('');
	}

	/**
	 * Generate an error with line and column numbers in the message.
	 *
	 * @param {string} message The text to display after the line and column number.
	 * @param {number} lineNumber The line number to display. If not provided, the current PEG parser position will be
	 * used.
	 * @param {number} columnNumber The column number to display. If not provided, the current PEG parser position will
	 * be used.
	 */
	function throwError(message, lineNumber, columnNumber) {
		if (lineNumber === undefined) {
			lineNumber = line();
		}
		if (columnNumber === undefined) {
			columnNumber = column();
		}
		error('Line ' + lineNumber + ', column ' + columnNumber + ': ' + message);
	}

	var tree = {
		_constructors: {},
		tagMap: {},

		/**
		 * Adds a new tag to the tags understood by this template.
		 *
		 * @param newAlias {Object}
		 * An object with the following keys:
		 *   * `tag` (string): The tag name to alias.
		 *   * `to` (string): The replacement constructor to use.
		 *   * `line` (number): The one-indexed line number where the alias was defined in the template.
		 *   * `column` (number): The one-indexed column number where the alias was defined in the template.
		 */
		addTag: function (newAlias) {
			var map = this.tagMap;

			// Tags are case-insensitive
			var tag = newAlias.tag.toLowerCase();
			var oldAlias = map[tag];

			if (oldAlias) {
				// The same alias has already been parsed once before, probably by some look-ahead; do not add it
				// again
				if (oldAlias.line === newAlias.line && oldAlias.column === newAlias.column) {
					return;
				}

				throwError('Alias "' + newAlias.tag + '" was already defined at line ' + oldAlias.line +
					', column ' + oldAlias.column,
					newAlias.line, newAlias.column);
			}
			else {
				map[tag] = newAlias;
			}
		},

		/**
		 * Retrieves the root tree structure for the given node.
		 *
		 * @returns {Object} The validated syntax tree for the given root node.
		 */
		get: function (root) {
			this._collectConstructors(root);

			return {
				constructors: getKeys(this._constructors),
				root: root
			};
		},

		/**
		 * Walks the widget tree, collecting constructor module IDs for the given node and its children.
		 */
		_collectConstructors: function (node) {
			if (hasOwnProperty.call(node, 'constructor')) {
				this._constructors[node.constructor] = true;
			}

			for (var key in node) {
				var value = node[key];
				if (value instanceof Array) {
					for (var i = 0, child; (child = value[i]); ++i) {
						this._collectConstructors(child);
					}
				}
				else if (typeof value === 'object' || typeof value === 'function') {
					this._collectConstructors(value);
				}
			}
		}
	};
}


// template root

Template =
	(Alias / S)* body:(
		// A non-element followed by anything other than whitespace should be considered a child of a root Element
		// widget, otherwise the parser fails on whatever follows. Changing this to capture zero or more Any tokens
		// would require modification to Template to special-case n = 1, which is unpleasant, and also generate a wacky
		// tree where the first widget is the first widget and then the second widget is an Element widget containing
		// all the rest of the widgets
		(widget:AnyNonElement S* !. { return widget; })
		/ Element
	)? {
		if (!body) {
			body = {
				constructor: toAbsMid('../ui/Element'),
				content: [],
				children: []
			};
		}
		return tree.get(body);
	}

// HTML

Element 'HTML'
	= nodes:(
		AnyNonElement
		/ Placeholder
		/ HtmlFragment
	)+ {
		var element = { constructor: toAbsMid('../ui/Element') };
		var content = [];
		var children = element.children = [];
		var nonWhitespace = /\S/;

		for (var i = 0, j = nodes.length; i < j; ++i) {
			var node = nodes[i];

			if (node instanceof Array) {
				content.push.apply(content, node);
			}
			else if (node.$placeholder) {
				content.push(node);
			}
			else {
				content.push({ $child: children.length });
				children.push(node);
			}
		}

		// Parse the string portions of our html template for text bindings
		var results = [];
		var item;
		var parsed;
		for (var i = 0, j = content.length; i < j; ++i) {
			item = content[i];

			if (typeof item === 'string') {
				parsed = parseBoundText(item);
				if (parsed.$bind) {
					Array.prototype.push.apply(results, parsed.$bind);
				}
				else {
					results.push(item);
				}
			}
			else {
				results.push(item);
			}
		}

		element.content = results;
		return element;
	}

// Users should be able to comment out widgets, at which point they are treated like part of the HTML content string
HtmlComment 'HTML comment'
	= '<!--'
		content:(
			[^-]
			/ dashed:('-' [^-]) {
				return dashed.join('');
			}
		)*
		'-->'
	{
		return '<!--' + content.join('') + '-->';
	}

HtmlFragment 'HTML'
	= content:(
		comment:HtmlComment { return [ comment ]; }
		/ !NonHtmlTags content:(HtmlTag / .) {
			return [].concat(content);
		}
	)+ {
		content = concat.apply([], content);
		var flattenedFragment = [];
		var lastIndex = -1;
		for (var i = 0, j = content.length; i < j; ++i) {
			if (typeof flattenedFragment[lastIndex] === 'string' && typeof content[i] === 'string') {
				flattenedFragment[lastIndex] += content[i];
			}
			else {
				flattenedFragment.push(content[i]);
				++lastIndex;
			}
		}

		return flattenedFragment;
	}

NonHtmlTags
	=
		// Optimization: Only check tag rules when the current position matches the tag opening token
		& '<'
		IfTagOpen
		/ ElseIfTag
		/ ElseTag
		/ IfTagClose
		/ ForTagOpen
		/ ForTagClose
		/ WhenTagOpen
		/ RejectedTag
		/ PendingTag
		/ WhenTagClose
		/ Placeholder
		/ InvalidAlias
		/ WidgetTagOpen
		/ WidgetTagClose
		/ AliasedWidgetTagOpen
		/ AliasedWidgetTagClose

TagName
	= firstChar:[a-zA-Z] restChars:[a-zA-Z0-9-]* {
		// convert to lower-case for case-insensitive comparison
		return (firstChar + restChars.join('')).toLowerCase();
	}

// It is necessary to parse HTML tags here in order to ensure well-formed attributes
HtmlTag
	= content:(
		$('<' TagName S+)
		HtmlAttributes
		$('/'? '>')
	) {
		return concat.apply([], content);
	}

HtmlAttributes
	= attributes:(key:$(AttributeNameChars '=') value:(AttributeStringValue / Binding) ws:$(S*) {
		return [ key + '"', value, '"' + ws ];
	})* {
		return concat.apply([], attributes);
	}

// Curly brackets are escaped (\x7b, \x7d) due to https://github.com/dmajda/pegjs/issues/89
BoundText
	= (
		HtmlComment
		/ Binding
		/ !'{' value:(
			// an escaped curly bracket
			'\\{' { return '\x7b'; }
			// a list of characters that do not start an HtmlComment
			/ !'<!--' char:([^{]) { return char; }
		)+ {
			return value.join('');
		}
	)*

Binding
	= value:BalancedBraces {
		var binding = {};

		if (value.charAt(1) === '{' && value.charAt(value.length - 2) === '}') {
			binding.$bind = value.slice(2, -2);
			binding.direction = 2;
		}
		else {
			binding.$bind = value.slice(1, -1);
			binding.direction = 1;
		}

		return binding;
	}

BalancedBraces
	= value:('{' BindingData '}') { return value.join(''); }

BindingData
	= value:(
		'\\{' { return '\x7b'; }
		/ '\\}' { return '\x7d'; }
		/ BalancedBraces
		/ [^{}]
	)* { return value.join(''); }

// conditionals

If '<if></if>'
	= kwArgs:IfTagOpen
	consequent:Any?
	alternates:(
		kwArgs:ElseIfTag consequent:Any? {
			kwArgs.consequent = consequent;
			return kwArgs;
		}
	)*
	finalAlternate:(kwArgs:ElseTag consequent:Any? {
		kwArgs.condition = true;
		kwArgs.consequent = consequent;
		return kwArgs;
	})?
	IfTagClose {
		kwArgs.consequent = consequent;

		var widget = { constructor: toAbsMid('../ui/Conditional') };
		widget.conditions = alternates ? alternates : [];
		widget.conditions.unshift(kwArgs);
		finalAlternate && widget.conditions.push(finalAlternate);
		return widget;
	}

IfTagOpen '<if>'
	= '<if'i kwArgs:AttributeMap '>' {
		validate(kwArgs, {
			type: '<if>',
			required: [ 'condition' ]
		});
		return kwArgs;
	}

IfTagClose '</if>'
	= '</if>'i

ElseIfTag '<elseif>'
	= '<elseif'i kwArgs:AttributeMap '>' {
		validate(kwArgs, {
			type: '<elseif>',
			required: [ 'condition' ]
		});
		return kwArgs;
	}

ElseTag '<else>'
	= '<else'i kwArgs:AttributeMap '>' {
		validate(kwArgs, {
			type: '<else>'
		});
		return kwArgs;
	}

// loops

For '<for></for>'
	= tagArgs:ForTagOpen
	template:Any
	ForTagClose {
		var kwArgs = {
			constructor: toAbsMid('../ui/Iterator'),
			collection: tagArgs.each,
			// $ctor is a special flag to the template processor to pass the generated constructor function for the
			// widget instead of generating an instance of the widget
			itemConstructor: { $ctor: template }
		};

		if (tagArgs.as) {
			kwArgs.as = tagArgs.as;
		}

		return kwArgs;
	}

ForTagOpen '<for>'
	= '<for'i kwArgs:AttributeMap '>' {
		validate(kwArgs, {
			type: '<for>',
			required: [ 'each' ],
			optional: [ 'as' ]
		});
		return kwArgs;
	}

ForTagClose '</for>'
	= '</for>'i

// promises

When '<when></when>'
	= kwArgs:WhenTagOpen
	fulfilled:Any?
	optional:(RejectedPendingTags / PendingRejectedTags)?
	WhenTagClose {
		if (!fulfilled) {
			throwError('<when> requires content as its first child');
		}
		kwArgs.constructor = toAbsMid('../ui/Promise');
		kwArgs.fulfilled = fulfilled;
		if (optional) {
			if (optional.rejected) {
				if (optional.rejected.as) {
					kwArgs.rejectedAs = optional.rejected.as;
				}
				kwArgs.rejected = optional.rejected.body;
			}
			if (optional.pending) {
				if (optional.pending.as) {
					kwArgs.pendingAs = optional.pending.as;
				}
				kwArgs.pending = optional.pending.body;
			}
		}
		kwArgs.value = kwArgs.value;
		return kwArgs;
	}

WhenTagOpen '<when>'
	= '<when'i kwArgs:AttributeMap '>' {
		validate(kwArgs, {
			type: '<when>',
			required: [ 'value' ],
			optional: [ 'as' ]
		});
		return kwArgs;
	}

WhenTagClose '</when>'
	= '</when>'i

PendingTag '<pending>'
	= '<pending'i kwArgs:AttributeMap '>' body:Any? {
		validate(kwArgs, {
			type: '<pending>',
			optional: [ 'as' ]
		});
		kwArgs.body = body;
		return kwArgs;
	}

RejectedTag '<rejected>'
	= '<rejected'i kwArgs:AttributeMap '>' body:Any? {
		validate(kwArgs, {
			type: '<rejected>',
			optional: [ 'as' ]
		});
		kwArgs.body = body;
		return kwArgs;
	}

RejectedPendingTags
	= rejected:RejectedTag
	  pending:PendingTag? {
		var kwArgs = {
			rejected: rejected
		};
		if (pending) {
			kwArgs.pending = pending;
		}
		return kwArgs;
	}

PendingRejectedTags
	= pending:PendingTag
	  rejected:RejectedTag? {
		var kwArgs = {
			pending: pending
		};
		if (rejected) {
			kwArgs.rejected = rejected;
		}
		return kwArgs;
	}

// widgets

Widget '<widget></widget>'
	= kwArgs:WidgetTagOpen children:(
		'/>' { return []; } / '>' children:Any* WidgetTagClose { return children; }
	) {
		var widget = {};

		for (var key in kwArgs) {
			if (key === 'is') {
				widget.constructor = kwArgs[key];
			}
			else {
				widget[key] = kwArgs[key];
			}
		}

		if (typeof widget.constructor !== 'string') {
			throwError('Widget constructor must be a string');
		}

		if (children.length) {
			widget.children = children;
		}

		return widget;
	}

WidgetTagOpen '<widget>'
	= '<widget'i kwArgs:AttributeMap &('/'? '>') {
		validate(kwArgs, {
			type: '<widget>',
			required: [ 'is' ],
			extensible: true
		});

		return kwArgs;
	}

WidgetTagClose '</widget>'
	= '</widget>'i

AliasedWidget '<tag></tag>'
	= value:(
		kwArgs:AliasedWidgetTagOpen '/>' {
			return { kwArgs: kwArgs, children: [] };
		}
		/ kwArgs:AliasedWidgetTagOpen '>' children:Any* end:AliasedWidgetTagClose &{ return end === kwArgs.tagName; } {
			return { kwArgs: kwArgs, children: children };
		}
	) {
		var children = value.children;
		var kwArgs = value.kwArgs;

		var widget = {
			constructor: tree.tagMap[kwArgs.tagName].to
		};

		for (var key in kwArgs) {
			if (key === 'tagName' || key === 'constructor') {
				continue;
			}
			widget[key] = kwArgs[key];
		}

		if (children.length) {
			widget.children = children;
		}

		return widget;
	}

AliasedWidgetTagOpen '<tag>'
	= '<' tagName:TagName &{ return hasOwnProperty.call(tree.tagMap, tagName); } kwArgs:AttributeMap & ('/'? '>') {
		kwArgs.tagName = tagName;
		return kwArgs;
	}

AliasedWidgetTagClose '</tag>'
	= '</' tagName:TagName &{ return hasOwnProperty.call(tree.tagMap, tagName); } '>' {
		return tagName;
	}

// all others

Placeholder '<placeholder>'
	= '<placeholder'i kwArgs:AttributeMap '/'? '>' {
		return { $placeholder: kwArgs.name || 'default' };
	}

Alias '<alias>'
	= '<alias'i alias:AttributeMap '/'? '>' {
		validate(alias, {
			type: '<alias>',
			required: [ 'tag', 'to' ]
		});
		alias.line = line();
		alias.column = column();

		tree.addTag(alias);
		return undefined;
	}

InvalidAlias '<alias>'
	= '<alias'i AttributeMap '/'? '>' {
		// InvalidAlias is strictly to generate an error after aliases at the top
		// of the template have been processed and the body of a template has begun
		// processing. Therefore, nothing is captured and nothing is returned.
		throwError('Aliases can only be defined at the beginning of the template');
	}

// attributes

AttributeMap
	= attributes:Attribute* S* {
		var attributeMap = {};
		for (var i = 0, attribute; (attribute = attributes[i]); ++i) {
			if (hasOwnProperty.call(attributeMap, attribute.name)) {
				throwError('Duplicate attribute "' + attribute.name + '"');
			}

			attributeMap[attribute.name] = attribute.value;
		}
		return attributeMap;
	}

Attribute
	= S+ name:AttributeName value:(
		S* '=' S* value:AttributeValue { return value; }
		/ { return true; }
	) {
		return { name: name, value: value };
	}

AttributeName
	= nameChars:AttributeNameChars {
		return nameChars.join('').toLowerCase().replace(/-(.)/, function () {
			return arguments[1].toUpperCase();
		});
	}

AttributeNameChars
	= [a-zA-Z0-9\-]+

AttributeValue
	= AttributeStringValue
	/ JsonValue
	/ Binding

AttributeStringValue
	= ("'" value:("\\'" { return "'"; } / [^'\r\n])* "'" { return parseBoundText(value.join('')); })
	/ ('"' value:('\\"' { return '"'; } / [^"\r\n])* '"' { return parseBoundText(value.join('')); })

// JSON parser, adapted from PEG.js example

JsonObject
	= '{' S* '}' { return {}; }
	/ '{' S* members:JsonMembers '}' { return members; }

JsonMembers
	= head:JsonPair tail:(',' S* JsonPair)* {
		var result = {};
		result[head[0]] = head[1];
		for (var i = 0; i < tail.length; i++) {
			result[tail[i][2][0]] = tail[i][2][1];
		}
		return result;
	}

JsonPair
	= name:JsonString ':' S* value:JsonValue S* { return [ name, value ]; }

JsonArray
	= '[' S* ']' { return [] }
	/ '[' S* elements:JsonElements ']' { return elements; }

JsonElements
	= head:JsonValue tail:("," S* JsonValue)* S* {
		var result = [ head ];
		for (var i = 0, j = tail.length; i < j; ++i) {
			result.push(tail[i][2]);
		}
		return result;
	}

JsonValue
	= JsonLiteral
	/ JsonObject
	/ JsonArray

JsonLiteral
	= JsonString
	/ JsonNumber
	/ JsonTrue
	/ JsonFalse
	/ JsonNull

JsonTrue 'true'
	= 'true' { return true; }

JsonFalse 'false'
	= 'false' { return false; }

JsonNull 'null'
	= 'null' { return null; }

JsonString 'string'
	= '"' '"' { return ""; }
	/ '"' chars:JsonChars '"' { return chars; }

JsonChars
	= chars:JsonChar+ { return chars.join(''); }

JsonChar
  // In the original Json grammar: "any-Unicode-character-except-"-or-\-or-control-character"
	= [^"\\\0-\x1F\x7f]
	/ '\\"' { return '"'; }
	/ '\\\\' { return '\\'; }
	/ '\\/' { return '/';  }
	/ '\\b' { return '\b'; }
	/ '\\f' { return '\f'; }
	/ '\\n' { return '\n'; }
	/ '\\r' { return '\r'; }
	/ '\\t' { return '\t'; }
	/ '\\u' digits:$(HexDigit HexDigit HexDigit HexDigit) { return String.fromCharCode(parseInt(digits, 16)); }

JsonNumber 'number'
	= parts:$(JsonInteger JsonFraction JsonExponent) { return parseFloat(parts); }
	/ parts:$(JsonInteger JsonFraction) { return parseFloat(parts); }
	/ parts:$(JsonInteger JsonExponent) { return parseFloat(parts); }
	/ parts:$(JsonInteger) { return parseFloat(parts); }

JsonInteger
	= Digit19 Digits
	/ Digit
	/ '-' Digit19 Digits
	/ '-' Digit

JsonFraction
	= '.' Digits

JsonExponent
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
	/ InvalidAlias
	/ Widget
	/ AliasedWidget

S 'whitespace'
	= [ \t\r\n]

{
	var hasOwnProperty = Object.prototype.hasOwnProperty;
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
			permitted[required[i]] = true;
		}
		for (i = 0, j = optional.length; i < j; ++i) {
			permitted[optional[i]] = true;
		}

		for (i = 0, j = required.length; i < j; ++i) {
			if (!hasOwnProperty.call(attributes, required[i])) {
				error('Missing required attribute "' + required[i] + '"' + type);
			}
		}

		if (!rules.extensible) {
			for (var name in attributes) {
				if (!hasOwnProperty.call(permitted, name)) {
					error('Invalid attribute "' + name + '"' + type);
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
				return { $bind: results };
			}
		}

		return results.join('');
	}

	var tree = {
		_aliasMap: null,
		_aliases: [],
		_constructors: {},

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
		addAlias: function (newAlias) {
			var aliases = this._aliases;

			// Ensure that aliases are limited to complete module ID fragments
			newAlias.from = newAlias.from.replace(/\/*$/, '/');
			newAlias.to = newAlias.to.replace(/\/*$/, '/');

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
		 * Retrieves the root tree structure for the given node.
		 *
		 * @returns {Object} The validated syntax tree for the given root node.
		 */
		get: function (root) {
			this._constructors = {};
			this._validate();
			this._resolve(root);

			return {
				constructors: this._getConstructors(),
				root: root
			};
		},

		/**
		 * Retrieves the list of resolved constructors that were discovered in the AST.
		 *
		 * @returns {string[]} An array of constructor module IDs.
		 */
		_getConstructors: function () {
			var constructors = [];
			for (var key in this._constructors) {
				constructors.push(key);
			}

			return constructors;
		},

		/**
		 * Walks the widget tree, resolving constructor aliases for the given node and its children.
		 */
		_resolve: function (node) {
			var aliasMap = this._aliasMap;

			if (hasOwnProperty.call(node, 'constructor')) {
				for (var k in aliasMap) {
					if (node.constructor.indexOf(k) === 0) {
						node.constructor = node.constructor.replace(k, aliasMap[k].to);
					}
				}

				this._constructors[node.constructor] = true;
			}

			for (var key in node) {
				var value = node[key];
				if (value instanceof Array) {
					for (var i = 0, child; (child = value[i]); ++i) {
						this._resolve(child);
					}
				}
				else if (typeof value === 'object' || typeof value === 'function') {
					this._resolve(value);
				}
			}
		},

		/**
		 * Validates that the collected aliases from the template are valid and do not contain duplicate definitions.
		 */
		_validate: function () {
			var aliases = this._aliases;
			var aliasMap = {};

			for (var i = 0, alias; (alias = aliases[i]); ++i) {
				if (hasOwnProperty.call(aliasMap, alias.from)) {
					var oldAlias = aliasMap[alias.from];
					throw new Error('Line ' + alias.line + ', column ' + alias.column + ': Alias "' + alias.from +
						'" was already defined at line ' + oldAlias.line + ', column ' + oldAlias.column);
				}

				aliasMap[alias.from] = alias;
			}

			this._aliasMap = aliasMap;
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
		(widget:AnyNonElement !. { return widget; })
		/ Element
	)? {
		if (root) {
			// If just one child and no content, collapse it
			if (!root.content && root.children && root.children.length === 1) {
				root = root.children[0];
			}
			// array of children, give them a container
			// TODO: This seems like it should not need to be
			else {
				root.constructor = toAbsMid('../ui/Element');
			}
		}
		else {
			root = { constructor: toAbsMid('../ui/Element') };
		}

		return tree.get(root);
	}

// HTML

Element 'HTML'
	= nodes:(
		AnyNonElement
		/ HtmlFragment
	)+ {
		var content = [];
		var element = {};
		var children = [];
		var nonWhitespace = /\S/;
		var hasContent;

		for (var i = 0, j = nodes.length; i < j; ++i) {
			var node = nodes[i];

			// Alias nodes are transformed into `null` since they cannot be removed entirely from the output
			if (!node) {
				continue;
			}

			if (typeof node === 'string') {
				content.push(node);
				hasContent = hasContent || nonWhitespace.test(node);
			}
			else if (node.$placeholder) {
				content.push(node);
				hasContent = true;
			}
			else {
				content.push({ $child: children.length });
				children.push(node);
			}
		}

		if (children.length) {
			element.children = children;
		}

		if (!hasContent) {
			// Return with content undefined it's just whitespace and/or children
			return element;
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
					results.push(parsed);
				}
			}
			else {
				results.push(item);
			}
		}

		element.content = results;
		element.constructor = toAbsMid('../ui/Element');
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
		HtmlComment
		// TODO: Not sure how valid these exclusions are
		/ !(
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
			/ Alias
			/ WidgetTagOpen
			/ WidgetTagClose
		)
		character:. { return character; }
	)+ {
		return content.join('');
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
	= '{' value:('\\}' { return '\x7d' } / [^}])* '}' {
		return { $bind: value.join('').replace(/^\s+|\s+$/g, '') };
	}

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
	= kwArgs:ForTagOpen
	template:Any
	ForTagClose {
		kwArgs.constructor = toAbsMid('../ui/Iterator');
		// $ctor is a special flag to the template processor to pass the generated constructor function for the widget
		// instead of generating an instance of the widget
		kwArgs.itemConstructor = { $ctor: template };
		kwArgs.collection = kwArgs.each;
		kwArgs.as = kwArgs.as;
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
	body:Any?
	// TODO: Allow <pending> and <rejected> to appear in either order
	pending:(kwArgs:PendingTag body:Any? {
		kwArgs.instance = body;
		return kwArgs;
	})?
	rejected:(kwArgs:RejectedTag body:Any? {
		kwArgs.instance = body;
		return kwArgs;
	})?
	WhenTagClose {
		kwArgs.constructor = toAbsMid('../ui/Resolver');
		kwArgs.resolved = body;
		// TODO: This is not correct; there should be a way to indicate a separate mechanism for creating a new view
		// scope for each of the instance widgets, instead of adding these keys, which do nothing right now
		kwArgs.pendingAs = pending && pending.as;
		kwArgs.rejectedAs = rejected && rejected.as;
		kwArgs.pending = pending.instance;
		kwArgs.rejected = rejected.instance;
		return kwArgs;
	}

WhenTagOpen '<when>'
	= '<when'i kwArgs:AttributeMap '>' S* {
		validate(kwArgs, {
			type: '<when>',
			required: [ 'promise' ],
			optional: [ 'as' ]
		});
		return kwArgs;
	}

WhenTagClose '</when>'
	= '</when>'i

PendingTag '<pending>'
	= '<pending'i kwArgs:AttributeMap '>' {
		validate(kwArgs, {
			type: '<pending>',
			optional: [ 'as' ]
		});
		return kwArgs;
	}

RejectedTag '<rejected>'
	= '<rejected'i kwArgs:AttributeMap '>' {
		validate(kwArgs, {
			type: '<rejected>',
			optional: [ 'as' ]
		});
		return kwArgs;
	}

// widgets

Widget '<widget></widget>'
	= kwArgs:WidgetTagOpen children:Any* WidgetTagClose {
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
			error('Widget constructor must be a string');
		}

		if (children.length) {
			widget.children = children;
		}

		return widget;
	}

WidgetTagOpen '<widget>'
	= '<widget'i kwArgs:AttributeMap '>' {
		validate(kwArgs, {
			type: '<widget>',
			required: [ 'is' ],
			extensible: true
		});

		return kwArgs;
	}

WidgetTagClose '</widget>'
	= '</widget>'i

// all others

Placeholder '<placeholder>'
	= '<placeholder'i kwArgs:AttributeMap '/'? '>' {
		return { $placeholder: kwArgs.name || 'default' };
	}

Alias '<alias>'
	= '<alias'i alias:AttributeMap '/'? '>' {
		validate(alias, {
			type: '<alias>',
			required: [ 'from', 'to' ]
		});
		alias.line = line();
		alias.column = column();
		tree.addAlias(alias);
		return undefined;
	}

// attributes

AttributeMap
	= attributes:Attribute* S* {
		var attributeMap = {};
		for (var i = 0, attribute; (attribute = attributes[i]); ++i) {
			if (hasOwnProperty.call(attributeMap, attribute.name)) {
				error('Duplicate attribute "' + attribute.name + '"');
			}

			attributeMap[attribute.name] = attribute.value;
		}
		return attributeMap;
	}

Attribute
	= S+ name:AttributeName value:(S* '=' S* value:AttributeValue {
		// Treat attributes without values as true
		return value === null ? true : value;
	})? {
		return { name: name, value: value };
	}

AttributeName
	= nameChars:[a-zA-Z\-]+ {
		return nameChars.join('').toLowerCase().replace(/-([a-z])/, function () {
			return arguments[1].toUpperCase();
		});
	}

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
	/ Placeholder
	/ Alias
	/ Widget

S 'whitespace'
	= [ \t\r\n]

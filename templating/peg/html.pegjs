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

		if (!rules.allowAnyAttribute) {
			for (var name in attributes) {
				if (!(name in permitted)) {
					error('Invalid attribute "' + name + '"' + type);
				}
			}
		}
	}

	function parseBoundText(text) {
		return parse(text, { startRule: 'BoundText' });
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
		(widget:AnyNonElement !. { return widget; })
		/ Element
	)? {
		if (!root) {
			root = {
				constructor: 'framework/ui/dom/Element',
				html: '',
				children: []
			};
		}

		aliases.validate();
		aliases.resolve(root);
		return root;
	}

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
			html: parseBoundText(html),
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
			/ Alias
			/ WidgetTagOpen
			/ WidgetTagClose
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
	= OpenToken 'if'i attributes:AttributeMap CloseToken {
		validate(attributes, { type: '<if>', required: [ 'condition' ] });
		return attributes;
	}

IfTagClose '</if>'
	= OpenToken '/if'i CloseToken

ElseIfTag '<elseif>'
	= OpenToken 'elseif'i attributes:AttributeMap CloseToken {
		validate(attributes, { type: '<elseif>', required: [ 'condition' ] });
		return attributes;
	}

ElseTag '<else>'
	= OpenToken 'else'i CloseToken

// loops

For '<for>'
	= forWidget:ForTagOpen template:Any ForTagClose {
		forWidget.constructor = 'framework/templating/html/ui/Iterator';
		forWidget.template = template;
		return forWidget;
	}

ForTagOpen '<for>'
	= OpenToken 'for'i attributes:AttributeMap CloseToken {
		validate(attributes, { type: '<for>', required: [ 'each', 'value' ] });
		return attributes;
	}

ForTagClose '</for>'
	= OpenToken '/for'i CloseToken

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
	= OpenToken 'when'i attributes:AttributeMap CloseToken S* {
		validate(attributes, { type: '<when>', required: [ 'promise' ], optional: [ 'value' ] });
		return attributes;
	}

WhenTagClose '</when>'
	= OpenToken '/when'i CloseToken

WhenErrorTag '<error>'
	= OpenToken 'error'i CloseToken

WhenProgressTag '<progress>'
	= OpenToken 'progress'i CloseToken

// widgets

Widget '<widget>'
	= widget:WidgetTagOpen children:(Any)* WidgetTagClose {
		widget.constructor = widget.is;
		delete widget.is;

		widget.children = children;
		return widget;
	}

WidgetTagOpen '<widget>'
	= OpenToken 'widget'i attributes:AttributeMap CloseToken {
		validate(attributes, { type: '<widget>', required: [ 'is' ], allowAnyAttribute: true });
		return attributes;
	}

WidgetTagClose '</widget>'
	= OpenToken '/widget'i CloseToken

// all others

Placeholder '<placeholder>'
	= OpenToken 'placeholder'i placeholder:AttributeMap CloseToken {
		validate(placeholder, { type: '<placeholder>', required: [ 'name' ] });
		placeholder.constructor = 'framework/templating/html/ui/Placeholder';
		return placeholder;
	}

Data '<data>'
	= OpenToken 'data'i attributes:AttributeMap CloseToken {
		validate(attributes, { type: '<data>', required: [ 'var' ], optional: [ 'safe' ] });

		var label = {
			constructor: 'framework/ui/dom/Label'
		};

		label[attributes.safe ? 'formattedText' : 'text'] = attributes['var'];
		return label;
	}

Alias '<alias>'
	= OpenToken 'alias'i alias:AttributeMap CloseToken {
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
	= nameChars:[a-zA-Z\-]+ {
		return nameChars.join('').toLowerCase().replace(/-([a-z])/, function () {
			return arguments[1].toUpperCase();
		});
	}

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
	/ Data
	/ Alias
	/ Widget

OpenToken '<'
	= '<' S*

CloseToken '>'
	= S* '>'

S 'whitespace'
	= [ \t\r\n]

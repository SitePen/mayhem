define([
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/_base/declare',
	'dojo/Deferred',
	'dojo/dom-construct',
	'./peg/templateParser',
	'./bindingExpressionRegistry',
	'./AttributeBinding',
	'./PlaceholderNode',
	'./ContentNode',
	'./IfNode',
	'./ForNode',
	'./WhenNode',
	'./DataNode',
	'./WidgetNode'
], function (
	lang,
	arrayUtil,
	declare,
	Deferred,
	domConstruct,
	templateParser,
	bindingExpressionRegistry,
	AttributeBinding,
	PlaceholderNode,
	ContentNode,
	IfNode,
	ForNode,
	WhenNode,
	DataNode,
	WidgetNode
) {

	var boundElementAttributeName = 'data-bound-element',
		widgetTypeAttributeName = 'is',
		widgetTypeAttributeSelector = '[' + widgetTypeAttributeName + ']';

	// TODO: This only matches cases where entire attribute value is a ${ expression }. Consider support for richer values.
	var nextDataBoundElementId = 1;
	function compileDataBoundAttributes(/*DomNode*/ element, /*Object*/ boundElementMap) {
		// summary:
		//		Compile data-bound attributes on an element and its children.
		// description:
		//		This function compiles data-bound attributes on an element and its children.
		//		When data bound attributes are found on an element, a data-bound-attributes attribute
		//		is added with a map of attribute names to expression ASTs.
		// element:
		//		The element to examine for data-bound attributes.
		// boundElementMap:
		// 		An object hash of data-bound element IDs to a hash of attribute names to expression ASTs.
		// returns: Boolean
		//		A boolean indicating whether any data-bound attributes were found.

		var boundAttributeMap = {},
			foundBoundAttributes = false,
			attributes = element.attributes,
			attribute,
			name,
			value;

		// Iterate backwards so we can remove attributes as we go
		// without affecting the next index.
		for (var i = attributes.length - 1; i >= 0; i--) {
			attribute = attributes[i];
			name = attribute.name;
			value = attribute.value;

			if (AttributeBinding.containsBindingExpression(value)) {
				boundAttributeMap[name] = value;
				element.removeAttribute(name);
				foundBoundAttributes = true;
			}
		}

		if (foundBoundAttributes) {
			boundElementMap[nextDataBoundElementId] = boundAttributeMap;
			element.setAttribute(boundElementAttributeName, nextDataBoundElementId);
			nextDataBoundElementId++;
		}

		for (var child = element.firstElementChild; child !== null; child = child.nextElementSibling) {
			if (compileDataBoundAttributes(child, boundElementMap)) {
				foundBoundAttributes = true;
			}
		}

		return foundBoundAttributes;
	}

	// TODO: Consider whether we want to allow applying more than one alias at a time. Keeping it simple now because it's possible to introduce circular aliases.
	function applyAliases(/**Array*/ aliases, /**String*/ moduleId) {
		// summary:
		//		Apply aliases to a module ID.
		//		Returns after first matching alias or after testing the module ID against all aliases.
		// aliases: Array
		//		An array of from/to pairs of strings.
		// moduleId: String
		//		The module ID to which aliases are applied.
		// returns: String
		//		The transformed module ID or the original module ID if no aliases applied.

		for (var i = 0, match; i < aliases.length && !match; i++) {
			match = moduleId.match(aliases[i].fromPattern);
			if (match) {
				var leading = moduleId.substring(0, match.index),
					trailing = moduleId.substring(match.index + match[1].length);
				return leading + aliases[i].to + trailing;
			}
		}

		return moduleId;
	}

	return {
		parse: function (/**String*/ templateSource) {
			// summary:
			//		Parse a template
			// templateSource:
			//		The template source text
			// returns:
			//		The template AST

			var templateAst = templateParser.parse(templateSource),
				aliases = arrayUtil.map(templateAst.aliases, function (alias) {
					return {
						fromPattern: new RegExp('(?:^)(' + alias.from + ')(?:$|/)'),
						to: alias.to
					};
				}),
				dependencyMap = {};

			function compileNode(astNode) {
				// summary:
				//		Compile an AST node and its children.
				// astNode:
				//		The AST node to compile

				var type = astNode.type;

				if (type === 'content') {
					// TODO: Is there a reason dom-construct.toDom() should be preferred here?
					// TODO: Create/use a DOM module that allows for use in the browser or on the command line (for builds).
					var domNode = domConstruct.create('div', { innerHTML: astNode.html });

					// TODO: Is this a good check for successful parsing?
					if (domNode.innerHTML.length !== astNode.html.length) {
						// TODO: Make this error more useful by including input and output.
						throw new Error('Unable to correctly parse template HTML.');
					}

					var boundElementMap = {};
					if (compileDataBoundAttributes(domNode, boundElementMap)) {
						astNode.boundElementMap = boundElementMap;
					}

					// Save compiled DOM back to AST HTML
					astNode.html = domNode.innerHTML;

					// Process child nodes
					arrayUtil.forEach(astNode.templateNodes, compileNode);
				}
				else if (type === 'if') {
					arrayUtil.forEach(astNode.conditionalBlocks, function (conditionalBlock) {
						conditionalBlock.content = compileNode(conditionalBlock.content);
					});
					if (astNode.elseBlock) {
						compileNode(astNode.elseBlock.content);
					}
				}
				else if (type === 'for') {
					astNode.content = compileNode(astNode.content);
				}
				else if (type === 'placeholder') {
					// Do nothing
				}
				else if (type === 'when') {
					for (var key in { resolvedContent: 1, errorContent: 1, progressContent: 1 }) {
						if (astNode[key]) {
							compileNode(astNode[key]);
						}
					}
				}
				else if (type === 'data') {
					// Do nothing
				}
				else if (type === 'widget') {
					var originalModuleId = astNode.properties.is;

					// Apply aliases
					var normalizedModuleId = applyAliases(aliases, originalModuleId);
					if (originalModuleId !== normalizedModuleId) {
						astNode.properties.is = normalizedModuleId;
					}

					dependencyMap[normalizedModuleId] = true;
				}
				else {
					throw new Error('Unrecognized template AST node type: ' + type);
				}

				return astNode;
			}

			compileNode(templateAst);

			// List dependency module IDs
			var dependencies = [];
			for (var moduleId in dependencyMap) {
				dependencies.push(moduleId);
			}
			templateAst.dependencies = dependencies;

			return templateAst;
		},

		load: function (/*Object*/ templateAst) {
			// summary:
			//		Load a template from a template AST.
			// templateAst:
			//		The template AST
			// returns: dojo/promise/Promise
			//		A promise resolving with a Template constructor.

			var dependencies = templateAst.dependencies,
				dependencyMap = {},
				ContentNodeWithDependencies = declare(ContentNode, {
					dependencyMap: dependencyMap,

					// Provide shared attribute names so we stay DRY.
					nodeIdAttributeName: templateAst.nodeIdAttributeName,
					widgetTypeAttributeName: widgetTypeAttributeName,
					boundElementAttributeName: boundElementAttributeName
				});

			function createNodeConstructor(astNode) {
				// summary:
				//		Load a template node and its children.
				// astNode:
				//		The AST node to load
				// returns: Function
				//		A template node constructor

				var type = astNode.type;
				
				var Constructor;
				if (type === 'content') {
					// TODO: Is there a reason dom-construct.toDom() should be preferred here?
					var domNode = domConstruct.create('div', { innerHTML: astNode.html });

					// TODO: Create a child-adoption module because we're using this everywhere and need to encapsulate an IE8 workaround anyway.
					var range = document.createRange();
					range.selectNodeContents(domNode);

					Constructor = declare(ContentNodeWithDependencies, {
						masterFragment: range.extractContents(),
						boundElementMap: astNode.boundElementMap || null,
						templateNodeConstructors: arrayUtil.map(astNode.templateNodes, createNodeConstructor)
					});

					range.detach();
				}
				else if (type === 'if') {
					Constructor = declare(IfNode, {
						conditionalBlocks: arrayUtil.map(astNode.conditionalBlocks, function (conditionalBlock) {
							return {
								condition: bindingExpressionRegistry.match(conditionalBlock.condition),
								ContentTemplate: createNodeConstructor(conditionalBlock.content)
							};
						}),
						elseBlock: astNode.elseBlock
							? { ContentTemplate: createNodeConstructor(astNode.elseBlock.content) }
							: null
					});
				}
				else if (type === 'for') {
					Constructor = declare(ForNode, {
						each: bindingExpressionRegistry.match(astNode.each),
						valueName: astNode.value,
						ContentTemplate: createNodeConstructor(astNode.content)
					});
				}
				else if (type === 'placeholder') {
					// TODO: Support default placeholder with no name attribute
					Constructor = declare(PlaceholderNode, { name: astNode.name });
				}
				else if (type === 'when') {
					Constructor = declare(WhenNode, {
						promise: bindingExpressionRegistry.match(astNode.promise),
						valueName: astNode.value,
						ResolvedTemplate: astNode.resolvedContent ? createNodeConstructor(astNode.resolvedContent) : null,
						ErrorTemplate: astNode.errorContent ? createNodeConstructor(astNode.errorContent) : null,
						ProgressTemplate: astNode.progressContent ? createNodeConstructor(astNode.progressContent) : null
					});
				}
				else if (type === 'data') {
					Constructor = declare(DataNode, {
						'var': bindingExpressionRegistry.match(astNode.var),
						safe: astNode.safe !== undefined
					});
				}
				else if (type === 'widget') {
					// TODO: Consider doing property-name conversion in the compilation step instead
					var staticProperties = {},
						boundProperties = {},
						eventHandlers = {};
					for (var key in astNode.properties) {
						if (!(key in { type: 1, is: 1 })) {
							var eventHandlerMatch = /^on-(.*)$/.exec(key);
							if (eventHandlerMatch) {
								var eventName = eventHandlerMatch[1];
								eventHandlers[eventName] = bindingExpressionRegistry.match(astNode.properties[key]);
							} else {
								// Convert property names from html-attribute-format to widgetFormat
								// TODO: Support other allowable character sets for attribute names
								var name = key.replace(/-[a-zA-Z]/g, function (match) {
									return match.charAt(1).toUpperCase();
								});
								if (AttributeBinding.containsBindingExpression(astNode.properties[key])) {
									boundProperties[key] = new AttributeBinding(astNode.properties[key]);
								}
								else {
									staticProperties[key] = astNode.properties[key];
								}
							}
						}
					}

					Constructor = declare(WidgetNode, {
						Widget: dependencyMap[astNode.properties.is],
						staticProperties: staticProperties,
						boundProperties: boundProperties,
						eventMap: eventHandlers
					});
				}
				else {
					throw new Error('Unrecognized template node type: ' + type);
				}

				// TODO: Rename id to something else since it is shared by all objects inheriting from the prototype.
				Constructor.prototype.id = astNode.id;

				return Constructor;
			}

			// Resolve template dependencies
			var deferredDependencies = new Deferred();
			require(dependencies, function () {
				for (var i = 0; i < dependencies.length; i++) {
					var moduleId = dependencies[i];
					dependencyMap[moduleId] = arguments[i];
				}
				deferredDependencies.resolve();
			});

			return deferredDependencies.then(function () {
				return createNodeConstructor(templateAst);
			});
		},

		compile: function (/*String*/ templateSource) {
			// summary:
			//		Parse and load a template
			// templateSource:
			//		The template source text
			// returns: dojo/promise/Promise
			//		A promise for a template constructor

			return this.load(this.parse(templateSource));
		}
	};
});

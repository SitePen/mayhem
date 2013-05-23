define([
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/_base/declare',
	'dojo/Deferred',
	'dojo/dom-construct',
	'./peg/templateParser',
	'./peg/expressionParser',
	'./DataBindingExpression',
	'./PlaceholderNode',
	'./ContentNode',
	'./IfNode',
	'./ForNode',
	'./WhenNode',
	'./DataNode'
], function (
	lang,
	arrayUtil,
	declare,
	Deferred,
	domConstruct,
	templateParser,
	expressionParser,
	DataBindingExpression,
	PlaceholderNode,
	ContentNode,
	IfNode,
	ForNode,
	WhenNode,
	DataNode
) {

	var boundElementAttributeName = 'data-bound-element',
		widgetTypeAttributeName = 'is',
		widgetTypeAttributeSelector = '[' + widgetTypeAttributeName + ']';

	// TODO: This only matches cases where entire attribute value is a ${ expression }. Consider support for richer values.
	var boundAttributePattern = /^\${(.+)}$/,
		nextDataBoundElementId = 1;
	function compileDataBoundAttributes(/*DomNode*/ element, /*Object?*/ boundElementMap) {
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
		// returns: Object
		//		The data-bound element map for this element and its children.

		boundElementMap = boundElementMap || {};

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

			if (boundAttributePattern.test(value)) {
				value = value.replace(boundAttributePattern, '$1');
				boundAttributeMap[name] = expressionParser.parse(value);
				element.setAttribute(name, null);
				foundBoundAttributes = true;
			}
		}

		if (foundBoundAttributes) {
			boundElementMap[nextDataBoundElementId] = boundAttributeMap;
			element.setAttribute(boundElementAttributeName, nextDataBoundElementId);
			nextDataBoundElementId++;
		}

		for (var child = element.firstElementChild; child !== null; child = child.nextElementSibling) {
			compileDataBoundAttributes(child, boundElementMap);
		}

		return boundElementMap;
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
			match = moduleId.match(aliases[i].from);
			if (match) {
				var leading = moduleId.substring(0, match.index),
					trailing = moduleId.substring(match.index + match[1].length);
				return leading + aliases[i].to + trailing;
			}
		}

		return moduleId;
	}

	return {
		compileFromSource: function (/**String*/ templateSource) {
			// summary:
			//		Compile a template from a source string
			// templateSource:
			//		The template source string
			// returns: dojo/promise/Promise
			//		A promise resolving with a Template constructor.

			var pegAst = templateParser.parse(templateSource);
			return this.compileFromAst(pegAst);
		},

		compileFromAst: function (/**Object*/ templateAst) {
			// summary:
			//		Compile a template from a template AST.
			// templateAst:
			//		The template AST
			// returns: dojo/promise/Promise
			//		A promise resolving with a Template constructor.

			// TODO: Some operations like dependency collection can be done at build time. Identify these and support skipping them if compiling a pre-processed template AST.

			var dependencyMap = {},
				aliases = arrayUtil.map(templateAst.aliases, function (aliasAst) {
					return {
						from: new RegExp('(?:^|/)(' + aliasAst.from + ')(?:$|/)'),
						to: aliasAst.to
					};
				}),
				ContentNodeWithDependencies = declare(ContentNode, {
					dependencyMap: dependencyMap,

					// Provide shared attribute names so we stay DRY.
					nodeIdAttributeName: templateAst.nodeIdAttributeName,
					widgetTypeAttributeName: widgetTypeAttributeName,
					boundElementAttributeName: boundElementAttributeName
				});

			function compileNode(astNode) {
				// summary:
				//		Compile an AST node and its children.
				// astNode:
				//		The AST node to compile
				// returns: Function
				//		A template node constructor

				var type = astNode.type;
				var Constructor;

				if (type === 'fragment') {
					// TODO: Is there a reason dom-construct.toDom() should be preferred here?
					var domNode = domConstruct.create('div', { innerHTML: astNode.html });

					// TODO: Is this a good check for successful parsing?
					if (domNode.innerHTML.length !== astNode.html.length) {
						// TODO: Make this error more useful by including input and output.
						throw new Error('Unable to correctly parse template HTML.');
					}

					// TODO: Only apply when parsing uncompiled AST
					// Collect dependencies
					arrayUtil.forEach(domNode.querySelectorAll(widgetTypeAttributeSelector), function (typedElement) {
						var originalModuleId = typedElement.getAttribute(widgetTypeAttributeName);

						// Apply aliases
						var normalizedModuleId = applyAliases(aliases, originalModuleId);
						if (originalModuleId !== normalizedModuleId) {
							typedElement.setAttribute(widgetTypeAttributeName, normalizedModuleId);
						}

						dependencyMap[normalizedModuleId] = true;
					});

					// TODO: Only apply when parsing uncompiled AST
					var boundElementMap = compileDataBoundAttributes(domNode);

					// Save compiled DOM back to AST HTML
					astNode.html = domNode.innerHTML;

					// TODO: Create a child-adoption module because we're using this everywhere and need to encapsulate an IE8 workaround anyway.
					var range = document.createRange();
					range.selectNodeContents(domNode);

					Constructor = declare(ContentNodeWithDependencies, {
						masterFragment: range.extractContents(),
						boundElementMap: boundElementMap,
						templateNodeConstructors: arrayUtil.map(astNode.templateNodes, compileNode)
					});

					range.detach();
				}
				else if (type === 'if') {
					Constructor = declare(IfNode, {
						conditionalBlocks: arrayUtil.map(astNode.conditionalBlocks, function (conditionalBlock) {
							return {
								condition: new DataBindingExpression(conditionalBlock.condition),
								ContentTemplate: compileNode(conditionalBlock.content)
							};
						}),
						elseBlock: astNode.elseBlock && astNode.elseBlock.content
							? { ContentTemplate: compileNode(astNode.elseBlock.content) }
							: null
					});
				}
				else if (type === 'for') {
					Constructor = declare(ForNode, {
						each: new DataBindingExpression(astNode.each),
						valueName: astNode.value,
						ContentTemplate: compileNode(astNode.content)
					});
				}
				else if (type === 'placeholder') {
					// TODO: Support default placeholder with no name attribute
					Constructor = declare(PlaceholderNode, { name: astNode.name });
				}
				else if (type === 'when') {
					Constructor = declare(WhenNode, {
						promise: new DataBindingExpression(astNode.promise),
						valueName: astNode.value,
						ResolvedTemplate: astNode.resolvedContent ? compileNode(astNode.resolvedContent) : null,
						ErrorTemplate: astNode.errorContent ? compileNode(astNode.errorContent) : null,
						ProgressTemplate: astNode.progressContent ? compileNode(astNode.progressContent) : null
					});
				}
				else if (type === 'data') {
					Constructor = declare(DataNode, {
						'var': new DataBindingExpression(astNode.var),
						safe: astNode.safe !== undefined
					});
				}
				else {
					throw new Error('Unrecognized template AST node type: ' + type);
				}

				Constructor.prototype.id = astNode.id;

				return Constructor;
			}

			var TemplateConstructor = compileNode(templateAst),
				dfd = new Deferred();

			// TODO: Only apply when parsing uncompiled AST
			// List dependency module IDs
			var dependencies = [];
			for (var moduleId in dependencyMap) {
				dependencies.push(moduleId);
			}

			// Resolve template dependencies
			// TODO: relative deps should be loaded relative to the template location
			require(dependencies, function () {
				for (var i = 0; i < dependencies.length; i++) {
					var moduleId = dependencies[i];
					dependencyMap[moduleId] = arguments[i];
				}

				// Include dependency MIDs and the compiled AST with the constructor
				// to be used by template-related build tasks.
				templateAst.compiled = true;
				TemplateConstructor.compiledAst = templateAst;
				TemplateConstructor.dependencies = dependencies;

				dfd.resolve(TemplateConstructor);
			});

			return dfd.promise;
		}
	};
});
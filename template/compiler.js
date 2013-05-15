define([
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/_base/declare',
	'dojo/Deferred',
	'dojo/query',
	'dojo/dom-construct',
	'dojo/dom-attr',
	'./peg/templateParser',
	'./peg/expressionParser',
	'./DataBindingExpression',
	'./PlaceholderNode',
	'./ContentNode',
	'./IfNode',
	'./ForNode',
	'./WhenNode',
	'./DataNode'
], function (lang, array, declare, Deferred, query, domConstruct, domAttr, templateParser, expressionParser, DataBindingExpression, PlaceholderNode, ContentNode, IfNode, ForNode, WhenNode, DataNode) {

	var BOUND_ATTRIBUTE_PATTERN = /^\${(.+)}$/;
	function compileDataBoundAttributes(element) {
		var boundAttributeMap = {},
			foundBoundAttributes = false,
			attributes = element.attributes,
			attribute,
			name,
			value,
			parsedExpression;

		// Iterate backwards so we can remove attributes as we go
		// without affecting the next index.
		for (var i = attributes.length - 1; i >= 0; i--) {
			attribute = attributes[i];
			name = attribute.name;
			value = attribute.value;

			if (BOUND_ATTRIBUTE_PATTERN.test(value)) {
				value = value.replace(BOUND_ATTRIBUTE_PATTERN, '$1');
				boundAttributeMap[name] = expressionParser.parse(value);
				domAttr.remove(element, name);
				foundBoundAttributes = true;
			}
		}

		if (foundBoundAttributes) {
			domAttr.set(element, 'data-bound-attributes', JSON.stringify(boundAttributeMap));
		}

		for (var child = element.firstElementChild; child !== null; child = child.nextElementSibling) {
			compileDataBoundAttributes(child);
		}
	}

	return {
		compileFromSource: function (templateSource) {
			var pegAst = templateParser.parse(templateSource);
			return this.compileFromAst(pegAst);
		},

		compileFromAst: function (templateAst) {
			function processNode(pegNode) {
				var type = pegNode.type;
				var Constructor;

				if (type === 'fragment') {
					// TODO: Is there a reason dom-construct.toDom() should be preferred here?
					var domNode = domConstruct.create('div');
					domNode.innerHTML = pegNode.html;
					if (domNode.innerHTML.length !== pegNode.html.length) {
						// TODO: Make this error more useful by including input and output.
						throw new Error('Unable to correctly parse template HTML.');
					}

					// Collect dependencies
					var dojoTypedDomNodes = query('[data-dojo-type]', domNode);
					for (var i = 0; i < dojoTypedDomNodes.length; i++) {

						var moduleId = domAttr.get(dojoTypedDomNodes, 'data-dojo-type');
						dependencyMap[moduleId] = true;
					}

					compileDataBoundAttributes(domNode);

					var fragment = document.createDocumentFragment();
					while (domNode.childNodes.length > 0) {
						fragment.appendChild(domNode.firstChild);
					}

					Constructor = declare(ContentNodeWithDependencies, {
						masterFragment: fragment,
						dependencyMap: dependencyMap,
						templateNodeConstructors: array.map(pegNode.templateNodes, processNode)
					});
				}
				else if (type === 'if') {
					Constructor = declare(IfNode, {
						conditionalBlocks: array.map(pegNode.conditionalBlocks, function (conditionalBlock) {
							return {
								condition: new DataBindingExpression(conditionalBlock.condition),
								ContentConstructor: processNode(conditionalBlock.content)
							};
						}),
						elseBlock: pegNode.elseBlock && pegNode.elseBlock.content
							? { ContentConstructor: processNode(pegNode.elseBlock.content) }
							: null
					});
				}
				else if (type === 'for') {
					Constructor = declare(ForNode, {
						each: new DataBindingExpression(pegNode.each),
						value: new DataBindingExpression(pegNode.value),
						ContentConstructor: processNode(pegNode.content)
					});
				}
				else if (type === 'placeholder') {
					// TODO: Support default placeholder with no name attribute
					Constructor = declare(PlaceholderNode, { name: pegNode.name });
				}
				else if (type === 'when') {
					Constructor = declare(WhenNode, {
						promiseName: new DataBindingExpression(pegNode.promise),
						ResolvedTemplate: pegNode.resolvedContent ? processNode(pegNode.resolvedContent) : null,
						ErrorTemplate: pegNode.errorContent ? processNode(pegNode.errorContent) : null,
						ProgressTemplate: pegNode.progressContent ? processNode(pegNode.progressContent) : null
					});
				}
				else if (type === 'data') {
					Constructor = declare(DataNode, {
						'var': new DataBindingExpression(pegNode.var)
					});
				}
				else {
					throw new Error('Unrecognized PEG AST node type: ' + type);
				}

				Constructor.prototype.id = pegNode.id;

				return Constructor;
			}

			var dependencyMap = {},
				ContentNodeWithDependencies = declare(ContentNode, { dependencyMap: dependencyMap }),
				TemplateConstructor = declare(processNode(templateAst), {
					placeholderMap: null,
					constructor: function () {
						this.placeholderMap = {};
					},
					_create: function (view, options) {
						this.inherited(arguments, [ view, lang.delegate(options, { root: this })]);
					}
				}),
				dfd = new Deferred();

			// List dependency module IDs
			var dependencies = [];
			for (var moduleId in dependencyMap) {
				dependencies.push(moduleId);
			}

			// Resolve template dependencies
			// TODO: relative deps will be loaded relative to this module.
			// it would be more intutive to make deps relative to the template. ids should be
			// adjusted to work like that.
			require(dependencies, function () {
				for (var i = 0; i < dependencies.length; i++) {
					var moduleId = dependencies[i];
					dependencyMap[moduleId] = arguments[i];
				}

				dfd.resolve({
					dependencies: dependencies,
					templateAst: templateAst,
					TemplateConstructor: TemplateConstructor
				});
			});

			return dfd.promise;
		}
	};
});
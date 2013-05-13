define([
	'dojo/_base/array',
	'dojo/_base/declare',
	'dojo/Deferred',
	'dojo/query',
	'dojo/dom-construct',
	'dojo/dom-attr',
	'./peg/newparser',
	'./Template',
	'./ast/PlaceholderNode',
	'./ast/ContentNode',
	'./ast/IfNode',
	'./ast/ForNode',
	'./ast/WhenNode',
	'./ast/DataNode'
], function (array, declare, Deferred, query, domConstruct, domAttr, pegParser, Template, PlaceholderNode, ContentNode, IfNode, ForNode, WhenNode, DataNode) {

	return {
		parseFromSource: function (templateSource) {
			var pegAst = pegParser.parse(templateSource);
			return this.parseFromAst(pegAst);
		},

		parseFromAst: function (templateAst) {
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

					// TODO: Walk tree looking for data bound attributes, adding a specific attribute so data bound elements can be queried on instantiation

					var fragment = document.createDocumentFragment();
					while (domNode.childNodes.length > 0) {
						fragment.appendChild(domNode.firstChild);
					}

					Constructor = declare(ContentNodeWithDependencies, {
						baseFragment: fragment,
						dependencyMap: dependencyMap,
						templateNodeConstructors: array.map(pegNode.templateNodes, processNode)
					});
				}
				else if (type === 'if') {
					Constructor = declare(IfNode, {
						conditionalBlocks: array.map(pegNode.conditionalBlocks, function (conditionalBlock) {
							return {
								condition: conditionalBlock.condition,
								content: processNode(conditionalBlock.content)
							};
						}),
						elseBlock: pegNode.elseBlock ? processNode(pegNode.elseBlock) : null
					});
				}
				else if (type === 'for') {
					Constructor = declare(ForNode, {
						each: pegNode.each,
						value: pegNode.value,
						content: processNode(pegNode.content)
					});
				}
				else if (type === 'placeholder') {
					Constructor = declare(PlaceholderNode, { id: pegNode.id });
				}
				else if (type === 'when') {
					Constructor = declare(WhenNode, {
						promise: pegNode.promise,
						resolvedContent: pegNode.resolvedContent ? processNode(pegNode.resolvedContent) : null,
						errorContent: pegNode.errorContent ? processNode(pegNode.errorContent) : null,
						progressContent: pegNode.progressContent ? processNode(pegNode.progressContent) : null
					});
				}
				else if (type === 'data') {
					Constructor = declare(DataNode, { 'var': pegNode.var });
				}
				else {
					throw new Error('Unrecognized PEG AST node type: ' + type);
				}

				Constructor.prototype.id = pegNode.id;

				return Constructor;
			}

			var dependencyMap = {},
				ContentNodeWithDependencies = declare(ContentNode, { dependencyMap: dependencyMap }),
				TemplateConstructor = processNode(templateAst),
				dfd = new Deferred();

			// List dependency module IDs
			var dependencies = [];
			for (var moduleId in dependencyMap) {
				dependencies.push(moduleId);
			}

			// Resolve template dependencies
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
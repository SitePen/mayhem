define([
	'dojo/_base/array',
	'./parse',
	'./renderer/Renderers'
], function (array, parse, Renderers) {

	function compiler(templateString, astRoot) {
		//	summary:
		//		Parses the templateString to produce an AST.  Based on that AST, a tree of renderers
		//		is generated.
		//	templateString: string
		//		The string representation of the template.
		//	astRoot:
		//		This contains any metadata associated with the AST.  The `program` property will
		//		be populated with the parsed AST nodes.  This object has the following properties:
		//		* toDom (function): See dojo/dom-construct.toDom
		//		* sourceUrl? (string): A source URL for the compiled function

		astRoot.program = parse(templateString, astRoot);

		// XXX: for now, shortcircuit the compiled function but come back to it once we have more
		// pieces working together.
		return new Renderers.Root(astRoot);

		// using the reference to compiler.compile here so someone could potentially replace it
		//return compiler.compile(ast, options);
	}

	// TODO: code generation is going to be stale for a while...

	function processAst(nodes, state) {
		//	summary:
		//		Walks the AST and generates code based on the generators available
		//	nodes: array
		//		An array of AST nodes
		//	state: object
		//		An object used to collect the generated state

		var i = 0,
			fn,
			node;

		while ((node = nodes[i++])) {
			fn = generators[node.type];
			if (fn) {
				fn(node, state);
			}
			else {
				console.warn('no symbol function for', node);
			}
		}
	}

	function compile(ast, options) {
		//	summary:
		//		Generates the compiled function used to render a template
		//	ast: object
		//		The root AST node
		//	options: object
		//		Options for the generated function
		//		* sourceUrl (string): A string used for the source URL of the generated function.
		//	returns: function
		//		A function for rendering the template.

		options = options || {};

		var code = [],
			deps = [],
			state = {
				code: code,
				deps: deps
			},
			sourceUrl = options.sourceUrl,
			render,
			src;

		code.push(
			'function unrender() { console.log("unrendered!", this); }',
			// vm means virtual machine in this context
			'var vm = this,',
				'dom = vm.dom,',
				'aspect = vm.aspect;',
			'aspect.after(view, "destroy", unrender);',
			'return '
		);

		processAst(ast, state);

		code.push(';');

		if (sourceUrl) {
			code.push('\n//@ sourceURL=' + sourceUrl);
		}

		/*jshint evil:true*/
		src = code.join('');
		render = new Function('view', src);
		render.code = src;
		render.deps = deps;

		return render;
	}

	var generators = {
			//	summary:
			//		A map of AST node types -> to code generator function

			'ElementNode': function (node, state) {
				//	summary:
				//		Generates the code related to rendering a DOM Node

				var code = state.code,
					deps = state.deps,
					childNodes = [],
					buffer = [];

				// dom(node.nodeName, { node.attributes }, [ node.childNodes ]);
				buffer.push('dom("' + node.nodeName);
				buffer.push('",{');
				buffer.push(array.map(node.attributes, function (attributeNode) {
					var nodeName = attributeNode.nodeName,
						nodeValue = attributeNode.nodeValue,
						key = '"' + nodeName + '"',
						value,
						state = {
							code: [],
							deps: deps
						};

					processAst(nodeValue, state);
					value = state.code.join('');

					// collect the data-dojo-type attributes as deps so that we can pre-load these
					// when the template is loaded.  this forces all data-dojo-type attrs to be
					// module ids rather than a dot-separated name.
					if (nodeName === 'data-dojo-type') {
						if (array.indexOf(deps, nodeValue) === -1) {
							deps.push(nodeValue);
						}
					}

					return key + ':' + value;
				}).join());
				buffer.push('},');
				buffer.push('[');
				processAst(node.childNodes, childNodes);
				buffer.push(childNodes.join());
				buffer.push('])');

				code.push(buffer.join(''));
			},
			'TextNode': function (node, state) {
				processAst(node.program, state);
			},
			'ContentNode': function (node, state) {
				// TODO: sanitize the content... content.replace(/\r/g, '\\r').replace(/\n/g, '\\n')
				console.log('hi there from this contentnode', node, state);
			},
			'IdNode': function (node, state) {
				console.log('hi from idnode', node, state);
			}
		};

	compiler.compile = compile;

	return compiler;
});
define([
	'dojo/_base/array'
], function (array) {

	// oldie doesn't have Node - we could maybe reduce or remove this though
	var Node = typeof Node !== 'undefined' ? Node : {
			ELEMENT_NODE: 1,
			ATTRIBUTE_NODE: 2,
			TEXT_NODE: 3,
			CDATA_SECTION_NODE: 4,
			ENTITY_REFERENCE_NODE: 5,
			ENTITY_NODE: 6,
			PROCESSING_INSTRUCTION_NODE: 7,
			COMMENT_NODE: 8,
			DOCUMENT_NODE: 9,
			DOCUMENT_TYPE_NODE: 10,
			DOCUMENT_FRAGMENT_NODE: 11,
			NOTATION_NODE: 12
		};

	function processNodeList(list) {
		//	summary:
		//		processes a list of DOM Nodes
		//	returns: array
		//		An array of AST nodes

		var nodes = [],
			i = 0,
			child;

		while ((child = list[i++])) {
			// TODO oldie walks every attribute even if it isn't in the markup
			nodes.push(new DOMNode(child));
		}

		return nodes;
	}

	function DOMNode(node) {
		//	summary:
		//		constructor for an AST node that represents a DOM Node

		var value = node.nodeValue,
			processValue = node.nodeType === Node.ATTRIBUTE_NODE || node.nodeType === Node.TEXT_NODE,
			isElement = node.nodeType === Node.ELEMENT_NODE;

		this.type = 'DOMNode';
		this.nodeName = node.nodeName;
		this.nodeType = node.nodeType;
		this.nodeValue = processValue ? processContent(value) : value;

		this.attributes = isElement ? processNodeList(node.attributes) : null;
		this.childNodes = isElement ? processNodeList(node.childNodes) : null;

		// maybe in the browser we can cloneNode on this rather than create a new one
		// TODO: if there's no good way to pass this element to the render function then remove this
		this.element = isElement ? node : null;

		// as we traverse the elements, deconstruct the tree
		// TODO: this is only needed if we're keeping the element
		if (isElement && node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	function sanitize(templateString) {
		//	summary:
		//		Our delimiters are <%= and %> but oldie thinks these are DOM nodes so we translate
		//		those to something that works.

		// first, we look for anything that matches our target delims and we escape it so it doesn't
		// get tokenized later.
		return templateString.replace(/(\xbf)/g, '\\$1')

		// next, replace the '<' and '>' with '\xbf' unless the opening tag was escaped as '\<%'
		.replace(codeSelector, function (match, ignoreChar, blockType, code) {
			if (ignoreChar) {
				return match;
			}
			else {
				return '\xbf%' + blockType + code + '%\xbf';
			}
		});
	}

	function processContent(content) {
		//	summary:
		//		Parses a string of content into the AST that represents that content
		//	content: string
		//		A string of text to be parsed based on our templating syntax
		//	returns: array
		//		An array of AST nodes

		// TODO: process the content into an ast
		//var nodes = [];

		return content;
	}

	function processAst(nodes, code) {
		//	summary:
		//		Walks the AST and generates code based on the generators available
		//	nodes: array
		//		An array of AST nodes
		//	code: array
		//		A buffer used to collect the generated code

		var i = 0,
			fn,
			node;

		while ((node = nodes[i++])) {
			fn = generators[node.type];
			if (fn) {
				fn(node, code);
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
			sourceUrl = options.sourceUrl,
			render,
			src;

		code.push(
			'function unrender() { console.log("unrendered!", this); }',
			'var vm = this,',
				'dom = vm.dom,',
				'aspect = vm.aspect;',
			'aspect.after(view, "destroy", unrender);',
			'return '
		);

		processAst(ast, code);

		code.push(';');

		if (sourceUrl) {
			code.push('\n//@ sourceURL=' + sourceUrl);
		}

		/*jshint evil:true*/
		src = code.join('');
		render = new Function('view', src);
		render.code = src;

		return render;
	}

	function compiler(element, options) {
		//	summary:
		//		Walks the DOM element, generates the AST and produces a compiled function.  The
		//		element passed in will not be included as part of the AST.
		//	element: Element
		//		A DOM Element that contains the parsed DOM representing the template.
		//	options:
		//		TODO: do we need any options?

		options = options || {};

		var ast = new DOMNode(element);

		// using the reference to compiler.compile here so someone could potentially replace it
		// the element passed in should be a wrapper element that will be discarded
		return compiler.compile(ast.childNodes, options);
	}

	var codeSelector = /(\\?)[<\xbf]%([!=])([\s\S]+?)%>/g,
		generators = {
			//	summary:
			//		A map of AST node types -> to code generator function

			'DOMNode': function (node, code) {
				//	summary:
				//		Generates the code related to rendering a DOM Node

				var childNodes = [],
					buffer = [];

				if (node.nodeType === Node.ELEMENT_NODE) {
					// dom(node.nodeName, { node.attributes }, [ node.childNodes ]);
					buffer.push('dom("' + node.nodeName);
					buffer.push('",{');
					buffer.push(array.map(node.attributes, function (attributeNode) {
						return '"' + attributeNode.nodeName + '"' + ':"' + attributeNode.nodeValue + '"';
					}).join());
					buffer.push('},');
					buffer.push('[');
					processAst(node.childNodes, childNodes);
					buffer.push(childNodes.join());
					buffer.push('])');

					code.push(buffer.join(''));
				}
			}
		};

	compiler.sanitize = sanitize;
	compiler.compile = compile;

	return compiler;
});
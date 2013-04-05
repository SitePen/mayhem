define([], function () {

	function ElementNode(node) {
		//	summary:
		//		constructor for an AST node that represents a DOM Element

		this.type = 'ElementNode';
		this.nodeName = node.nodeName.toLowerCase();

		this.attributes = processAttributes(node);
		this.program = parse(node);

		// in the browser we can cloneNode on this rather than create a new one
		// TODO: if there's no good way to pass this element to the render function then remove this
		this.element = node;
	}

	function TextNode(node) {
		//	summary:
		//		constructor for an AST node that represents a non-Element DOM Node

		this.type = 'TextNode';
		this.program = processContent(node.nodeValue);
	}

	function AttributeNode(nodeName, nodeValue) {
		//	summary:
		//		A constructor for an AST node that represents a Node Attribute

		this.type = 'AttributeNode';
		this.nodeName = nodeName;
		// attribute values are always unescaped
		this.program = processContent(nodeValue, true);
	}

	function DOMNode(node) {
		//	summary:
		//		Constructor for an AST node that represents DOM Nodes that don't have alternative
		//		specific AST nodes.

		this.type = 'DOMNode';
		this.nodeName = node.nodeName;
		this.nodeType = node.nodeType;
	}

	function ContentNode(content) {
		//	summary:
		//		A constructor for an AST node that represents plain content

		this.type = 'ContentNode';
		this.content = content;
	}

	function IdNode(path, unescaped) {
		//	summary:
		//		A constructor for an AST node that represents an identifier

		var bound = path.indexOf('@') === 0,
			inverse;

		if (bound) {
			path = path.slice(1);
		}

		inverse = path.indexOf('!') === 0;

		if (inverse) {
			path = path.slice(1);
		}

		this.type = 'IdNode';
		this.path = path;
		this.escaped = !unescaped;
		this.bound = bound;
		this.inverse = inverse;
	}

	function parse(node) {
		//	summary:
		//		Processes a node's childNodes and removes the children as they are processed
		//	node: Node
		//		The parent of the childNodes
		//	returns: array
		//		An array of AST nodes

		var ast = [],
			child;

		while (node.childNodes.length) {
			child = node.removeChild(node.childNodes[0]);
			switch (child.nodeType) {
			case Node.ELEMENT_NODE:
				ast.push(new ElementNode(child));
				break;
			case Node.TEXT_NODE:
				ast.push(new TextNode(child));
				break;
			default:
				ast.push(new DOMNode(child));
			}
		}

		return ast;
	}

	function processContent(content, forceUnescaped) {
		//	summary:
		//		Parses a string of content into the AST that represents that content
		//	content: string
		//		A string of text to be parsed based on our templating syntax
		//	returns: array
		//		An array of AST nodes

		var exec,
			lastIndex = 0,
			leftOverChars = content,
			codeSelector = parse.codeSelector,
			nodes = [];

		while ((exec = codeSelector.exec(content))) {
			// the first capture is to see if this delim was escaped.  if this was escaped, we need
			// to include this match as content and keep iterating.
			if (!exec[1]) {
				// do we need to create a ContentNode?
				if (exec.index > lastIndex) {
					nodes.push(new ContentNode(content.slice(lastIndex, exec.index)));
				}
				lastIndex = codeSelector.lastIndex;
				leftOverChars = content.slice(lastIndex);
				// TODO: we will support more than just identifiers but for now assume just ids
				nodes.push(new IdNode(exec[3], exec[2] === '!' || forceUnescaped));
			}
		}

		if (leftOverChars) {
			nodes.push(new ContentNode(leftOverChars));
		}

		return nodes;
	}

	function processAttributes(node) {
		//	summary:
		//		Processes a list of Attribute Nodes
		//	node:
		//		The node containing the attributes to be processed.
		//	returns: array
		//		An array of AST nodes

		var attributes = node.attributes,
			ast = [],
			i = 0,
			child,
			name,
			value;

		while ((child = attributes[i++])) {
			name = child.nodeName;
			// oldie doesn't like you looking at nodeValue for some attributes
			value = node.getAttribute(name);
			// oldie walks every attribute even if it isn't in the markup
			if (value != null) {
				ast.push(new AttributeNode(name, value));
			}
		}

		return ast;
	}

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

	parse.codeSelector = /(\\?)[<\xbf]%([!=])\s*([\s\S]+?)\s*%[>\xbf]/g;

	return parse;
});
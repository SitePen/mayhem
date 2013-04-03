define([], function () {

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

	function processAttributes(node) {
		//	summary:
		//		Processes a list of Attribute Nodes
		//	node:
		//		The node containing the attributes to be processed.
		//	returns: array
		//		An array of AST nodes

		var attributes = node.attributes,
			nodes = [],
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
				nodes.push(new AttributeNode(name, value));
			}
		}

		return nodes;
	}

	function parse(node) {
		//	summary:
		//		Processes a node's childNodes and removes the children as they are processed
		//	node: Node
		//		The parent of the childNodes
		//	returns: array
		//		An array of AST nodes

		var nodes = [],
			child;

		while (node.childNodes.length) {
			child = node.removeChild(node.childNodes[0]);
			if (child.nodeType === Node.ELEMENT_NODE) {
				nodes.push(new ElementNode(child));
			}
			else {
				nodes.push(new DOMNode(child));
			}
		}

		return nodes;
	}

	function ElementNode(node) {
		//	summary:
		//		constructor for an AST node that represents a DOM Element
		this.type = 'ElementNode';
		this.nodeName = node.nodeName;
		this.nodeType = Node.ELEMENT_NODE;
		this.nodeValue = node.nodeValue;

		this.attributes = processAttributes(node);
		this.childNodes = parse(node);

		// maybe in the browser we can cloneNode on this rather than create a new one
		// TODO: if there's no good way to pass this element to the render function then remove this
		this.element = node;
	}

	function DOMNode(node) {
		//	summary:
		//		constructor for an AST node that represents a non-Element DOM Node

		var value = node.nodeValue,
			processValue = node.nodeType === Node.TEXT_NODE;

		this.type = 'DOMNode';
		this.nodeName = node.nodeName;
		this.nodeType = node.nodeType;
		this.nodeValue = processValue ? processContent(value) : value;
	}

	function AttributeNode(nodeName, nodeValue) {
		//	summary:
		//		A constructor for an AST node that represents a Node Attribute

		this.type = 'AttributeNode';
		this.nodeName = nodeName;
		this.nodeType = Node.ATTRIBUTE_NODE;
		this.nodeValue = nodeValue;
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

		this.type = 'IdNode';
		this.path = path;
		this.escaped = !unescaped;
	}

	function processContent(content) {
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
				nodes.push(new IdNode(exec[3], exec[2] === '!'));
			}
		}

		if (leftOverChars) {
			nodes.push(new ContentNode(leftOverChars));
		}

		return nodes;
	}

	parse.codeSelector = /(\\?)[<\xbf]%([!=])\s*([\s\S]+?)\s*%[>\xbf]/g;

	return parse;
});
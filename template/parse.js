define([
	'dojo/_base/array',
	'dojo/string',
	'./peg/parser'
], function (array, string, peg) {

	function ElementNode(node) {
		//	summary:
		//		constructor for an AST node that represents a DOM Element

		this.type = 'Element';
		this.nodeName = node.nodeName.toLowerCase();

		this.attributes = processAttributes(node);
		this.program = parseNode(node);

		// in the browser we can cloneNode on this rather than create a new one
		// TODO: if there's no good way to pass this element to the render function then remove this
		this.node = node;
	}

	function TextNode(node) {
		//	summary:
		//		constructor for an AST node that represents a non-Element DOM Node

		this.type = 'Text';
		this.program = peg.parse(node.nodeValue);
	}

	function AttributeNode(nodeName, nodeValue) {
		//	summary:
		//		A constructor for an AST node that represents a Node Attribute

		this.type = 'Attribute';
		this.nodeName = nodeName;
		this.program = peg.parse(nodeValue);
	}

	function DOMNode(node) {
		//	summary:
		//		Constructor for an AST node that represents DOM Nodes that don't have alternative
		//		specific AST nodes.

		this.type = 'DOMNode';
		this.nodeName = node.nodeName;
		this.nodeType = node.nodeType;
	}

	function BlockNode(block, astRoot) {
		this.type = 'Block';

		// since domConstruct.toDom sometimes returns a fragment and sometimes a node, we'll
		// wrap the content so we know what we're working with
		var wrapper = astRoot.toDom('<div></div>'),
			node = astRoot.toDom(block.content);

		wrapper.appendChild(node);

		this.content = parseNode(wrapper);
		this.blocks = array.map(block.blocks, function (block) {
			return new BlockNode(block, astRoot);
		});
		// placeholders shouldn't need any further processing
		this.placeholders = block.placeholders;
		this.uid = block.uid;
		// TODO: inverse and any other properties we need to handle
	}

	function parse(templateString, astRoot) {
		var program = peg.parse(templateString);

		// the ProgramNode is just a placeholder for statements so we don't need to keep it around
		program = processStatements(program.statements);

		if (astRoot.program) {
			console.warn('unexpected program in astRoot', astRoot);
		}

		astRoot.program = new BlockNode(program, astRoot);
	}

	function processStatements(statements) {
		var statement,
			content,
			uid,
			program,
			inverse,
			blocks = [],
			placeholders = {},
			output = {
				content: '',
				blocks: blocks,
				placeholders: placeholders
			};

		while ((statement = statements.shift())) {
			switch (statement.type) {
			// TODO: ideally the parser would be able to ignore variables during this pass so that
			// we don't have to reconstruct them for the next (post-DOM) pass.
			case 'Variable':
				// reconstruct the variable for parsing later
				content = '<%' +
					(statement.unescaped ? '! ' : ' ') +
					(statement.bound ? '@' : '') +
					(statement.inverted ? '!' : '') +
					statement.id +
					'%>';

				// collapse variables into content statements
				output.content += content;
				break;
			// collapse multiple content/variable blocks into a single content block
			case 'Content':
				output.content += statement.content;
				break;
			// store placeholder statements in the placeholders map
			case 'Placeholder':
				// add a script tag with a unique id so we can locate where to place this later
				uid = getUid();
				output.content += string.substitute(SCRIPT_TEMPLATE, { uid: uid });

				// store the uid on the statement so we can correlate it to the script tag
				statement.uid = uid;

				// TODO: throw an error if something has already used that name?
				// add to the available placeholders in this template.
				placeholders[statement.name] = statement;
				break;
			// keep a list of block statements and recursively process the statements of their programs
			case 'Block':
				// add a script tag so we can locate where to place this block
				uid = getUid();
				output.content += string.substitute(SCRIPT_TEMPLATE, { uid: uid });

				// store the uid on the statement so we can correlate to the script tag
				statement.uid = uid;

				// recurse into the block to process it's statements
				program = statement.program;
				if (program) {
					statement.program = processStatements(program.statements);
				}
				inverse = statement.inverse;
				if (inverse) {
					statement.inverse = processStatements(inverse.statements);
				}

				// add this to the list of blocks for this section of content
				blocks.push(statement);
				break;
			default:
				// hopefully we don't get here
				console.warn('unexpected statement type', statement.type, statement);
			}
		}

		return output;
	}

	function parseNode(node) {
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

	function getUid() {
		return uidPrefix + uid++;
	}

	function randomChar() {
		return String.fromCharCode(97 + Math.round(Math.random() * 26));
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
		},
		uid = 0,
		uidPrefix = randomChar() + randomChar() + randomChar(),
		SCRIPT_TEMPLATE = '<script id="${uid}-start"></script><script id="${uid}-end"></script>';

	return parse;
});
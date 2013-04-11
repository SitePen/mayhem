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
		this.statements = parseNode(node);

		// in the browser we can cloneNode on this rather than create a new one
		// TODO: if there's no good way to pass this element to the render function then remove this
		this.node = node;
	}

	function TextNode(node) {
		//	summary:
		//		constructor for an AST node that represents a non-Element DOM Node

		this.type = 'Text';
		// TODO: handle parsing empty strings
		this.program = peg.parse(node.nodeValue);
	}

	function AttributeNode(nodeName, nodeValue) {
		//	summary:
		//		A constructor for an AST node that represents a Node Attribute

		this.type = 'Attribute';
		this.nodeName = nodeName;
		// TODO: handle parsing empty strings
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

	function ProgramNode(program, astRoot) {
		this.type = 'Program';

		// since domConstruct.toDom sometimes returns a fragment and sometimes a node, we'll
		// wrap the content so we know what we're working with
		var wrapper = astRoot.toDom('<div></div>'),
			statements = processStatements(program.statements, astRoot),
			inverse = program.inverse,
			node = astRoot.toDom(statements.content);

		wrapper.appendChild(node);

		this.statements = parseNode(wrapper);
		this.slots = statements.slots;

		if (inverse) {
			inverse = processStatements(inverse, astRoot);
			astRoot.empty(wrapper);
			node = astRoot.toDom(inverse.content);
			wrapper.appendChild(node);
			this.inverse = {
				statements: parseNode(wrapper),
				slots: inverse.slots
			};
		}
	}

	function BlockNode(block, astRoot) {
		var inverse = block.inverse;

		this.type = 'Block';
		this.isInverse = block.isInverse;
		this.program = new ProgramNode(block.program, astRoot);
		if (inverse) {
			this.inverse = new ProgramNode(block.inverse, astRoot);
		}
	}

	function SlotNode(uid) {
		this.type = 'Slot';
		this.uid = uid;
	}

	function parse(templateString, astRoot) {
		var program = peg.parse(templateString);

		return new ProgramNode(program, astRoot);
	}

	function processStatements(statements, astRoot) {
		statements = statements.slice();

		var statement,
			content,
			slots = {},
			output = {
				content: '',
				slots: slots
			},
			uid;

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
				uid = getUid();
				// add a script tag with a unique id so we can locate where to place this later
				output.content += string.substitute(SCRIPT_TEMPLATE, { uid: uid });

				// add this placeholder to our slots
				slots[uid] = statement;
				break;
			// keep a list of block statements and recursively process the statements of their programs
			case 'Block':
				uid = getUid();
				// add a script tag so we can locate where to place this block
				output.content += string.substitute(SCRIPT_TEMPLATE, { uid: uid });

				// add this block to our slots
				slots[uid] = new BlockNode(statement, astRoot);
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
				if (child.nodeName.toLowerCase() === 'script' && child.type === 'mayhem/slot') {
					ast.push(new SlotNode(child.getAttribute('data-uid')));
				}
				else {
					ast.push(new ElementNode(child));
				}
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
		return 'uid' + uid++;
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
		SCRIPT_TEMPLATE = '<script type="mayhem/slot" data-uid="${uid}"></script>',
		uid = 0;

	return parse;
});
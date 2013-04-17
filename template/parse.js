define([
	'dojo/_base/array',
	'dojo/string',
	'./peg/parser'
], function (array, string, peg) {

	function domAttributeProcessor(name, value) {
		//	summary:
		//		Processes attributes of DOM nodes

		switch (name) {
		case dataDojoAttachPoint:
			return new DojoAttachPointNode(value);
		case dataDojoAttachEvent:
			return new DojoAttachEventNode(value);
		case dataAction:
			return new DojoAttachEventNode(value, true);
		default:
			return new AttributeNode(name, value);
		}
	}

	function dojoTypeAttributeProcessor(name, value) {
		//	summary:
		//		Processes attributes of DOM nodes that have a data-dojo-type attribute

		var nodes = [],
			props,
			k;

		if (name === dataDojoProps) {
			// decompose the value into separate attributes
			try {
				// this is essentially dojo/_base/json.fromJson
				/*jshint evil:true*/
				props = eval('({' + value + '})');
			}
			catch (e) {
				throw new Error(e.toString() + ' in data-dojo-props="' + value + '"');
			}

			for (k in props) {
				nodes.push(new DojoPropNode(k, props[k]));
			}

			return nodes;
		}
		else {
			return new DojoPropNode(name, value);
		}
	}

	function ElementNode(node, statements) {
		//	summary:
		//		constructor for an AST node that represents a DOM Element
		//	node: Element
		//		The Element to be represented in the AST.

		this.type = 'Element';
		this.nodeName = node.nodeName.toLowerCase();

		this.attributes = processAttributes(node, domAttributeProcessor);
		this.statements = statements;

		// in the browser we can cloneNode on this rather than create a new one
		// TODO: if there's no good way to pass this element to the render function then remove this
		this.node = node;
	}

	function TextNode(node) {
		//	summary:
		//		constructor for an AST node that represents a Text DOM Node
		//	node: DOM Node
		//		The Text Node to be represented in the AST

		this.type = 'Text';
		// TODO: handle parsing empty strings
		this.program = peg.parse(node.nodeValue);
	}

	function AttributeNode(nodeName, nodeValue) {
		//	summary:
		//		A constructor for an AST node that represents a DOM Node Attribute
		//	nodeName: string
		//		The name of the attribute.
		//	nodeValue: string
		//		The value of the attribute.  This string will be parsed for templating syntax.
		//		Templating blocks cannot be used in the value of an attribute.

		this.type = 'Attribute';
		this.nodeName = nodeName;
		// TODO: handle parsing empty strings
		this.program = peg.parse(nodeValue);
	}

	function DOMNode(node) {
		//	summary:
		//		Constructor for an AST node that represents DOM Nodes that don't have alternative
		//		specific AST nodes.
		//	node: DOM Node
		//		The DOM Node to be represented in the AST

		// TODO: these AST nodes are currently discarded.  if they are never used then stop creating them.
		this.type = 'DOMNode';
		this.nodeName = node.nodeName;
		this.nodeType = node.nodeType;
	}

	function ProgramNode(program, options) {
		//	summary:
		//		A constructor for an AST node that represents a program
		//	program:
		//		The templating syntax AST.
		//	options:
		//		An object with the following property:
		//		* toDom (function): see dojo/dom-construct.toDom

		this.type = 'Program';

		// since domConstruct.toDom sometimes returns a fragment and sometimes a node, we'll
		// wrap the content so we know what we're working with
		var wrapper = options.toDom('<div></div>'),
			statements = processStatements(program.statements, options),
			inverse = program.inverse,
			node = options.toDom(statements.content),
			found = {},
			tree;

		wrapper.appendChild(node);

		tree = parseNode(wrapper);
		this.statements = tree.ast;
		this.deps = array.filter(tree.deps, function (dep) {
			return !found[dep] && (found[dep] = true);
		});

		this.slots = statements.slots;

		if (inverse) {
			inverse = processStatements(inverse, options);
			options.empty(wrapper);
			node = options.toDom(inverse.content);
			wrapper.appendChild(node);
			this.inverse = {
				statements: parseNode(wrapper),
				slots: inverse.slots
			};
		}
	}

	function BlockNode(block, options) {
		//	summary:
		//		A constructor for an AST node that represents a block of content
		//	block:
		//		A templating syntax Block node.
		//	options:
		//		An object with the following property:
		//		* toDom (function): see dojo/dom-construct.toDom

		var inverse = block.inverse;

		this.type = 'Block';
		this.isInverse = block.isInverse;
		this.program = new ProgramNode(block.program, options);
		if (inverse) {
			this.inverse = new ProgramNode(block.inverse, options);
		}
	}

	function SlotNode(uid) {
		//	summary:
		//		A constructor for an AST node that represents a slot in the template.  Slots may
		//		contain blocks or placeholders.
		//	uid:
		//		A unique identifier for this slot.  Identifiers only need to be unique per template.

		this.type = 'Slot';
		this.uid = uid;
	}

	function DojoTypeNode(dojoType, node) {
		this.type = 'DojoType';

		this.dojoType = dojoType;
		if (node.hasAttribute(dataDojoAttachPoint)) {
			this.attachPoint = new DojoAttachPointNode(node.getAttribute(dataDojoAttachPoint));
			node.removeAttribute(dataDojoAttachPoint);
		}
		if (node.hasAttribute(dataDojoAttachEvent)) {
			this.attachEvent = new DojoAttachEventNode(node.getAttribute(dataDojoAttachEvent));
			node.removeAttribute(dataDojoAttachEvent);
		}
		if (node.hasAttribute(dataAction)) {
			this.attachAction = new DojoAttachEventNode(node.getAttribute(dataAction), true);
			node.removeAttribute(dataAction);
		}
		this.dojoProps = processAttributes(node, dojoTypeAttributeProcessor);
		// TODO: recurse into the children of this node... and figure out what to do about that :/
	}

	function DojoPropNode(name, value) {
		this.type = 'DojoProp';

		this.name = name;
		// TODO: handle parsing empty strings
		this.program = peg.parse(value);
	}

	function DojoAttachPointNode(value) {
		this.type = 'DojoAttachPoint';
		this.points = string.trim(value).split(/\s*,\s*/);
	}

	function DojoAttachEventNode(value, isAction) {
		this.type = 'DojoAttachEvent';
		var pairs = string.trim(value).split(/\s*,\s*/),
			pair,
			events = [];

		while ((pair = string.trim(pairs.shift() || ''))) {
			events.push(pair.indexOf(':') ? pair.split(/\s*:\s*/) : [pair, pair]);
		}

		this.events = events;
		this.isAction = !!isAction;
	}

	function parse(templateString, options) {
		//	summary:
		//		Parses a string and returns an AST representing the program for that template.
		//	templateString: string
		//		The string of the template to be parsed
		//	options:
		//		An object with the following property:
		//		* toDom (function): see dojo/dom-construct.toDom

		var program = peg.parse(templateString);

		return new ProgramNode(program, options);
	}

	function processStatements(statements, options) {
		//	summary:
		//		Processes a list of statements
		//	statements:
		//		The list of statements to be processed
		//	options:
		//		An object with the following property:
		//		* toDom (function): see dojo/dom-construct.toDom
		//	returns:
		//		An object with the following properties:
		//		* content (string): content to be be parsed as DOM
		//		* slots (object): a map of uid -> AST node that represents the slots found in the
		//		template

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
				slots[uid] = new BlockNode(statement, options);
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
		//	returns:
		//		An object with the following properties:
		//		* ast (array): An array of AST nodes
		//		* deps (array): An array of module ids collected from data-dojo-type attributes

		var ast = [],
			// deps will not have unique ids, the list should be filtered before being used
			deps = [],
			tree,
			dojoType,
			child;

		while (node.childNodes.length) {
			child = node.removeChild(node.childNodes[0]);
			switch (child.nodeType) {
			case Node.ELEMENT_NODE:
				if (child.nodeName.toLowerCase() === 'script' && child.type === 'mayhem/slot') {
					ast.push(new SlotNode(child.getAttribute('data-uid')));
				}
				else if (child.hasAttribute(dataDojoType)) {
					dojoType = child.getAttribute(dataDojoType);
					child.removeAttribute(dataDojoType);
					deps.push(dojoType);
					ast.push(new DojoTypeNode(dojoType, child));
				}
				else {
					tree = parseNode(child);
					ast.push(new ElementNode(child, tree.ast));
					deps = deps.concat(tree.deps);
				}
				break;
			case Node.TEXT_NODE:
				ast.push(new TextNode(child));
				break;
			default:
				ast.push(new DOMNode(child));
			}
		}

		return {
			deps: deps,
			ast: ast
		};
	}

	function processAttributes(node, processor) {
		//	summary:
		//		Processes a list of Attribute Nodes
		//	node: Element
		//		The node containing the attributes to be processed.
		//	processor: function
		//		A function that takes the following arguments:
		//		* name (string): the attribute name
		//		* value (string): the value of the attribute
		//		and returns an array or single instance of AST nodes
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
				ast = ast.concat(processor(name, value));
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
		uid = 0,
		// these are here primarily to make it easy to update the code
		dataDojoType = 'data-dojo-type',
		dataDojoProps = 'data-dojo-props',
		dataDojoAttachPoint = 'data-dojo-attach-point',
		dataDojoAttachEvent = 'data-dojo-attach-event',
		dataAction = 'data-action';

	return parse;
});
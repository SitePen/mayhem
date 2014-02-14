import array = require('dojo/_base/array');
import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import DomContainer = require('./Container');
import domUtil = require('./util');
import lang = require('dojo/_base/lang');
import MultiNodeWidget = require('./MultiNodeWidget');
import Placeholder = require('./Placeholder');
import NamedPlaceholder = require('../../templating/html/ui/Placeholder');
import PlacePosition = require('../PlacePosition');
import util = require('../../util');
import widgets = require('../interfaces');

var CHILD_PATTERN:RegExp = /^\s*child#(\d+)\s*$/,
	BINDING_PATTERN:RegExp = /^\s*binding#(\d+)\s*$/;

/**
 * The Element class provides a DOM-specific widget that encapsulates one or more DOM nodes.
 */
class DomElement extends DomContainer {
	private _boundTextNodes:Text[];
	private _childPositions:Node[];
	/* protected */ _content:Node;
	/* protected */ _html:string;

	// TODO: TS#2153
	// get(key:'children'):widgets.IDomWidget[];
	// get(key:'html'):string;
	// get(key:'placeholders'):{ [id:string]:widgets.IPlaceholder; };
	// set(key:'children', value:widgets.IDomWidget[]):void;
	// set(key:'html', value:string):void;

	constructor(kwArgs:any) {
		this._childPositions = [];
		util.deferMethods(this, [ '_placeChildren' ], '_render');
		util.deferSetters(this, [ 'content' ], '_render');
		super(kwArgs);
	}

	/* protected */ _childrenSetter(children:widgets.IDomWidget[]):void {
		this._children = children || [];
		this._placeChildren();
	}

	private _placeChildren():void {
		// TODO: find a way to use DomContainer#add to do this?
		// TODO: this.empty();
		var children:widgets.IDomWidget[] = this._children,
			targets:Node[] = this._childPositions,
			target:Node,
			widget:widgets.IDomWidget,
			firstNode:Node,
			lastNode:Node,
			content:Node;
		for (var i = 0, l = Math.min(targets.length, children.length); i < l; ++i) {
			target = targets[i];
			widget = children[i];
			firstNode = widget.get('firstNode');
			lastNode = widget.get('lastNode');
			content = firstNode === lastNode ? lastNode : domUtil.getRange(firstNode, lastNode).extractContents();
			target.parentNode.replaceChild(content, target);
			widget.set('index', i);
			widget.set('parent', this);
			widget.emit('attached');
		}
		// TODO: placeholders
	}

	private _contentSetter(content:Node):void {
		this.clear();
		this._lastNode.parentNode.insertBefore(content, this._lastNode);
	}

	private _createTextBinding(index:number, binding:string):Text {
		var textNode:Text = this._boundTextNodes[index] = document.createTextNode('');
		// TODO: might be best to do something like this: this.bind('_boundText.' + index, binding)
		// and then set our text nodes on changes, but NestedProxty isn't cooperating
		// If we can figure this out we can remove the half-baked NodeProxty too
		this.addBinding(this.get('app').get('binder').bind({
			source: this.get('mediator'),
			sourceBinding: binding,
			target: textNode,
			targetBinding: 'nodeValue'
		}));
		return textNode;
	}

	destroy():void {
		// TODO
		this._boundTextNodes = null;
		super.destroy();
	}

	private _htmlSetter(html:any):void {
		this._boundTextNodes = [];

		// If html is a string no need to do any fancy processing
		if (typeof html === 'string') {
			this._html = html;
			this.set('content', html)
			return;
		}

		var createTextBinding = lang.hitch(this, this._createTextBinding),
			childPositions = this._childPositions;

		// Process and create placeholders for children and text node bindings
		// (this should typically be followed by a call to set children)
		var processed:string[] = array.map(html, (item:any, i:number):string => {
			if (!item.binding) {
				return item;
			}
			// Insert comment to mark binding location so we easily replace in generated dom
			return '<!-- binding#' + i + ' -->';
		});
		this._html = processed.join('');

		function processComment(node:Node):void {
			var parent:Node = node.parentNode,
				match:string[],
				newNode:Node,
				index:number;
			// We only care about comment nodes
			if (node.nodeType !== Node.COMMENT_NODE) {
				return;
			}
			// Test for child comment marker
			if (match = node.nodeValue.match(CHILD_PATTERN)) {
				index = Number(match[1]);
				childPositions[index] = node;
			}
			// Test for bound text comment marker
			else if (match = node.nodeValue.match(BINDING_PATTERN)) {
				index = Number(match[1]);
				newNode = createTextBinding(index, html[index].binding);
				parent.replaceChild(newNode, node);
			}
		}

		// Recurse and handle comments standing in for child and binding placeholders
		function processChildComments(node:Node):void {
			var next:Node;
			// Iterate siblings
			while (node != null) {
				// Capture next sibling before manipulating dom
				next = node.nextSibling;
				// Sweep and process children recursively
				for (var i = 0, length = node.childNodes.length; i < length; ++i) {
					processChildComments(node.childNodes[i]);
				}
				processComment(node);
				node = next;
			}
		}

		// We need to get a fragment from our markup and process its comments before inserting
		var content:Node = domConstruct.toDom(this._html);
		processChildComments(content);
		this.set('content', content);
	}
}

export = DomElement;

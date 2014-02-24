import array = require('dojo/_base/array');
import ContentComponent = require('./ContentComponent');
import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import domUtil = require('./util');
import util = require('../../util');
import ui = require('../interfaces');

var CHILD_PATTERN:RegExp = /^\s*child#(\d+)\s*$/,
	BINDING_PATTERN:RegExp = /^\s*binding#(\d+)\s*$/;

/**
 * The Element class provides a DOM-specific widget that encapsulates one or more DOM nodes.
 */
class ViewWidget extends ContentComponent implements ui.IViewWidget {
	/* private */ _childPlaceholders:ui.IPlaceholder[]; // TODO
	private _childPositionNodes:Node[];
	/* protected */ _content:DocumentFragment;
	/* protected */ _html:string;
	private _textBindingHandles:IHandle[];
	private _textBindingNodes:Node[];
	private _textBindingPaths:string[];

	// TODO: TS#2153
	// get(key:'children'):ui.IDomWidget[];
	// get(key:'html'):string;
	// get(key:'placeholders'):{ [name:string]:ui.IPlaceholder; };
	// set(key:'children', value:ui.IDomWidget[]):void;
	// set(key:'html', value:string):void;

	constructor(kwArgs:any = {}) {
		util.deferMethods(this, [ '_bindTextNodes' ], '_activeMediatorSetter');
		util.deferMethods(this, [ '_placeChildren', '_contentSetter' ], '_render');
		super(kwArgs);
	}

	/* protected */ _childrenSetter(children:ui.IDomWidget[]):void {
		this._children = children || [];
		this._placeChildren();
	}

	private _bindTextNodes():void {
		util.destroyHandles(this._textBindingHandles);
		this._textBindingHandles = [];
		var node:Node,
			path:string;
		for (var i = 0, l = this._textBindingNodes.length; i < l; i++) {
			node = this._textBindingNodes[i];
			path = this._textBindingPaths[i];
			if (!node || !path) continue;
			this._textBindingHandles[i] = this.bind(node, path);
		}
	}

	private _placeChildren():void {
		// TODO: find a way to use DomContainer#add for this?
		// TODO: work out how to do a this.empty()
		var children:ui.IDomWidget[] = this._children,
			targets:Node[] = this._childPositionNodes,
			target:Node,
			child:ui.IDomWidget,
			firstNode:Node,
			lastNode:Node,
			contents:Node;
		for (var i = 0, l = Math.min(targets.length, children.length); i < l; ++i) {
			child = children[i];
			if (!child) {
				continue;
			}
			target = targets[i];
			firstNode = child.get('firstNode');
			lastNode = child.get('lastNode');
			contents = firstNode === lastNode ? lastNode : domUtil.getRange(firstNode, lastNode).extractContents();
			target.parentNode.replaceChild(contents, target);
			child.set('index', i);
			child.set('parent', this);
		}
		// TODO: placeholders?
	}

	private _contentSetter(content:DocumentFragment):void {
		// TODO: clear children
		this.clear();
		this._lastNode.parentNode.insertBefore(content, this._lastNode);
	}

	destroy():void {
		util.destroyHandles(this._textBindingHandles);
		this._childPositionNodes = this._content = null;
		this._textBindingHandles = this._textBindingNodes = this._textBindingPaths = null;
		super.destroy();
	}

	private _htmlSetter(html:any):void {
		// TODO: clean up previous
		this._textBindingNodes = [];
		this._textBindingPaths = [];
		this._childPositionNodes = [];

		// Process and create placeholders for children and text bindings
		var processed:string[] = array.map(html, (item:any, i:number):string => {
			// Insert comment to mark binding or child location so we easily replace in generated dom
			if (item.binding != null) {
				return '<!-- binding#' + i + ' -->';
			}
			if (item.child != null) {
				return '<!-- child#' + item.child + ' -->';
			}
			return item;
		});
		this._html = processed.join('');

		var processComment = (node:Node):void => {
			var parent:Node = node.parentNode,
				match:string[],
				textNode:Text;
			// We only care about comment nodes
			if (node.nodeType !== Node.COMMENT_NODE) {
				return;
			}
			// Test for child comment marker
			if (match = node.nodeValue.match(CHILD_PATTERN)) {
				this._childPositionNodes[Number(match[1])] = node;
			}
			// Test for bound text comment marker
			else if (match = node.nodeValue.match(BINDING_PATTERN)) {
				textNode = new Text();
				this._textBindingNodes.push(textNode);
				this._textBindingPaths.push(html[Number(match[1])].binding);
				parent.replaceChild(textNode, node);
			}
		}

		// Recurse and handle comments standing in for child and binding placeholders
		var processChildComments = (node:Node):void => {
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
		this._bindTextNodes();
		this.setContent(<DocumentFragment> content);
	}

	setContent(content:DocumentFragment):void {
		this.set('content', content);
	}
}

export = ViewWidget;

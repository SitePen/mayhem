import array = require('dojo/_base/array');
import ContentWidget = require('./ContentWidget');
import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import domUtil = require('./util');
import Placeholder = require('./Placeholder');
import util = require('../../util');
import ui = require('../interfaces');

var COMMENT_PATTERN:RegExp = /^\s*⟨⟨({[^{]+})⟩⟩\s*$/;

class ViewWidget extends ContentWidget implements ui.IViewWidget {
	private _childPositionNodes:Node[]; // TODO: remove
	/* protected */ _content:DocumentFragment;
	/* protected */ _indexedPlaceholders:ui.IPlaceholder[]; // TODO
	/* protected */ _namedPlaceholders:{ [key:string]: ui.IPlaceholder };
	private _textBindingHandles:IHandle[];
	private _textBindingNodes:Node[];
	private _textBindingPaths:string[];

	constructor(kwArgs:any = {}) {
		this._indexedPlaceholders = []; // TODO: remove this once we fix Dijit
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
		for (var i = 0, len = this._textBindingNodes.length; i < len; i++) {
			node = this._textBindingNodes[i];
			path = this._textBindingPaths[i];
			if (!node || !path) continue;
			this._textBindingHandles[i] = this.bind(node, path);
		}
	}

	private _placeChildren():void {
		var children:ui.IDomWidget[] = this._children,
			positions:Node[] = this._childPositionNodes,
			position:Node,
			child:ui.IDomWidget,
			firstNode:Node,
			lastNode:Node,
			contents:Node;
		// We can't do anything unless we have both
		if (!positions || !children) return;
		for (var i = 0, len = Math.min(positions.length, children.length); i < len; ++i) {
			child = children[i];
			if (!child) {
				continue;
			}
			position = positions[i];
			firstNode = child.get('firstNode');
			lastNode = child.get('lastNode');
			contents = firstNode === lastNode ? lastNode : domUtil.getRange(firstNode, lastNode).extractContents();
			position.parentNode.replaceChild(contents, position);
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
		this._childPositionNodes = this._indexedPlaceholders = this._content = null;
		this._textBindingHandles = this._textBindingNodes = this._textBindingPaths = null;
		super.destroy();
	}

	setContent(content:any  /* Node | string */):void {
		// TODO: clean up previous
		this._textBindingNodes = [];
		this._textBindingPaths = [];
		this._childPositionNodes = [];
		this._indexedPlaceholders = [];
		this._namedPlaceholders = {};

		var handleComment = (node:Node):void => {
			var parent:Node = node.parentNode,
				match:string[] = node.nodeValue.match(COMMENT_PATTERN),
				descriptor:any = match && JSON.parse(match[1]);
			if (!descriptor) {
				return;
			}
			if (descriptor.$child != null) {
				this._childPositionNodes[descriptor.$child] = node;
			}
			else if (descriptor.$bind != null) {
				var textNode:Text = new Text();
				this._textBindingNodes.push(textNode);
				this._textBindingPaths.push(descriptor.$bind);
				parent.replaceChild(textNode, node);
			}
			else if (descriptor.$named != null) {
				// TODO
				// var placeholder = this._namedPlaceholders[descriptor.$named] = new Placeholder();
			}
		};

		// Recurse and handle comments standing in for child and binding placeholders
		var scanForComments = (node:Node):void => {
			var next:Node;
			// Iterate siblings
			while (node != null) {
				// Capture next sibling before manipulating dom
				next = node.nextSibling;
				for (var i = 0, len = node.childNodes.length; i < len; ++i) {
					scanForComments(node.childNodes[i]);
				}
				if (node.nodeType === Node.COMMENT_NODE) {
					handleComment(node);
				}
				node = next;
			}
		}

		// We need to get a fragment from our markup and process its comments before inserting
		var node:Node = this._content = <DocumentFragment> domConstruct.toDom(content);
		scanForComments(node);
		this._bindTextNodes();
		this.set('content', node);
		this._placeChildren();
	}
}

export = ViewWidget;

import array = require('dojo/_base/array');
import ContentWidget = require('./ContentWidget');
import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import domUtil = require('./util');
import Placeholder = require('./Placeholder');
import PlacePosition = require('../PlacePosition');
import util = require('../../util');
import ui = require('../interfaces');

var COMMENT_PATTERN:RegExp = /^\s*⟨⟨({[^{]+})⟩⟩\s*$/;

class ViewWidget extends ContentWidget implements ui.IViewWidget {
	/* protected */ _childPlaceholders:Placeholder[];
	/* protected */ _content:DocumentFragment;
	/* protected */ _namedPlaceholders:{ [key:string]: Placeholder };
	private _textBindingHandles:IHandle[];
	private _textBindingNodes:Node[];
	private _textBindingPaths:string[];

	constructor(kwArgs:any = {}) {
		util.deferMethods(this, [ '_bindTextNodes' ], '_activeMediatorSetter');
		util.deferMethods(this, [ '_placeContent' ], '_render');
		super(kwArgs);
	}

	add(widget:ui.IDomWidget, position:PlacePosition):IHandle;
	add(widget:ui.IDomWidget, position:number):IHandle;
	add(widget:ui.IDomWidget, placeholder:string):IHandle;
	add(widget:ui.IDomWidget, position:any = PlacePosition.LAST):IHandle {
		if (typeof position === 'number' && this._childPlaceholders) {
			widget.set('parent', this);
			this._childPlaceholders[position].set('content', widget);
			return;
		}
		if (typeof position === 'string' && this._namedPlaceholders) {
			widget.set('parent', this);
			this._namedPlaceholders[position].set('content', widget);
			return;
		}
		else {
			return super.add(widget, position);
		}
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

	/* protected */ _contentSetter(content:any /* Node | string */):void {
		if (typeof content === 'string') {
			content = domConstruct.toDom(content);
		}
		this._content = <DocumentFragment> content;

		// TODO: leaky...clean up previous
		this._textBindingNodes = [];
		this._textBindingPaths = [];
		this._childPlaceholders = [];
		this._namedPlaceholders = {};
		this._processComments(content);
		this._bindTextNodes();
		this._placeContent();
	}

	destroy():void {
		util.destroyHandles(this._textBindingHandles);
		this._namedPlaceholders = this._childPlaceholders = this._content = null;
		this._textBindingHandles = this._textBindingNodes = this._textBindingPaths = null;
		super.destroy();
	}

	// TODO: break this into separate handlers for children, bindings and named placeholders
	/* protected */ _handleComment(node:Node):void {
		var parent:Node = node.parentNode,
			match:string[] = node.nodeValue.match(COMMENT_PATTERN),
			descriptor:any = match && JSON.parse(match[1]),
			placeholder:Placeholder;
		if (!descriptor) {
			return;
		}
		// Replace comment node marker with something we can actually use
		if (descriptor.$child != null) {
			placeholder = this._childPlaceholders[descriptor.$child] = new Placeholder();
			parent.replaceChild(placeholder.detach(), node);
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
	}

	/* protected */ _placeContent():void {
		this.clear();
		this._lastNode.parentNode.insertBefore(this._content, this._lastNode);
	}

	private _processComments(node:Node):void {
		// Recurse and handle comments standing in for child and binding placeholders
		var next:Node;
		while (node != null) {
			// Capture next sibling before manipulating dom
			next = node.nextSibling;
			for (var i = 0, len = node.childNodes.length; i < len; ++i) {
				this._processComments(node.childNodes[i]);
			}
			if (node.nodeType === Node.COMMENT_NODE) {
				this._handleComment(node);
			}
			node = next;
		}
	}
}

export = ViewWidget;

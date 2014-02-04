import array = require('dojo/_base/array');
import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import DomContainer = require('./Container');
import domUtil = require('./util');
import lang = require('dojo/_base/lang');
import MultiNodeWidget = require('./MultiNodeWidget');
import Placeholder = require('./Placeholder');
import PlacePosition = require('../PlacePosition');
import util = require('../../util');
import widgets = require('../interfaces');

var CHILD_PATTERN:RegExp = /^\s*child#(\d+)\s*$/,
	BINDING_PATTERN:RegExp = /^\s*binding#(\d+)\s*$/;

/**
 * The Element class provides a DOM-specific widget that encapsulates one or more DOM nodes.
 */
class Element extends MultiNodeWidget {

	private _boundTextNodes:Text[];
	children:widgets.IDomWidget[];
	html:string;
	private _placeholders:Placeholder[];

	constructor(kwArgs:any) {
		util.deferSetters(this, [ 'html' ], '_render');
		super(kwArgs);
		// TODO: find a better event name
		this.on('childrenChanged', util.debounce(this._refreshPlaceholders));
	}

	private _childrenSetter(children:widgets.IDomWidget[]):void {
		this.children = children;
		this.emit('childrenChanged');
	}

	private _createChildPlaceholder(index:number):DocumentFragment {
		var placeholder:Placeholder = this._placeholders[index] = new Placeholder({});
		return domUtil.getRange(placeholder.firstNode, placeholder.lastNode).extractContents();
	}

	private _createTextBinding(index:number, binding:string):Text {
		var textNode:Text = this._boundTextNodes[index] = document.createTextNode('');
		// TODO: might be best to do something like this: this.bind('_boundText.' + index, binding)
		// and then set our text nodes on changes, but NestedProxty isn't cooperating
		// If we can figure this ou twe can remove the half-baked NodeProxty too
		this.addBinding(this.app.binder.bind({
			source: this.get('mediator'), // TODO: we may want to cache for long scope lookup chains
			sourceBinding: binding,
			target: textNode,
			targetBinding: 'nodeValue'
		}));
		return textNode;
	}

	destroy():void {
		array.forEach(this._placeholders || [], (item:Placeholder):void => item.destroy());
		array.forEach(this.children, (child:widgets.IDomWidget):void => child.destroy());
		this._boundTextNodes = this.children = this._placeholders = null;
		super.destroy();
	}

	empty():void {
		super.empty();
		this._placeholders = [];
		this._boundTextNodes = [];
	}

	private _htmlSetter(html:any):void {
		this.empty();

		// If html is a string no need to do any fancy processing
		if (typeof html === 'string') {
			this.html = html;
			this.lastNode.parentNode.insertBefore(domConstruct.toDom(html), this.lastNode);
			return;
		}

		var createChildPlaceholder = lang.hitch(this, this._createChildPlaceholder),
			createTextBinding = lang.hitch(this, this._createTextBinding);

		// Process and create placeholders for children and text node bindings
		// (this should typically be followed by a call to set children)
		var processed:string[] = array.map(html, (item:any, i:number):string => {
			if (!item.binding) {
				return item;
			}
			// Insert comment to mark binding location so we easily replace in generated dom
			return '<!-- binding#' + i + ' -->';
		});
		this.html = processed.join('');

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
				newNode = createChildPlaceholder(index);
			}
			// Test for bound text comment marker
			else if (match = node.nodeValue.match(BINDING_PATTERN)) {
				index = Number(match[1]);
				newNode = createTextBinding(index, html[index].binding);
			}
			newNode && parent.replaceChild(newNode, node);
		}

		// Recurse and handle comments standing in for child and binding placeholders
		function processChildren(node:Node):void {
			var next:Node;
			// Iterate siblings
			while (node != null) {
				// Capture next sibling before manipulating dom
				next = node.nextSibling;
				// Sweep and process children recursively
				for (var i = 0, length = node.childNodes.length; i < length; ++i) {
					processChildren(node.childNodes[i]);
				}
				processComment(node);
				node = next;
			}
		}

		// We need to get a fragment from our markup and process its comments before inserting
		var fragment:Node = domConstruct.toDom(this.html);
		processChildren(fragment);
		this.lastNode.parentNode.insertBefore(fragment, this.lastNode);
		this.emit('childrenChanged');
	}

	private _refreshPlaceholders():void {
		// Nothing to do if there are no placeholders or children
		if (!this._placeholders || !this.children) {
			return;
		}
		// Loop over child placeholders and set to associated child widget
		var placeholder:Placeholder,
			child:widgets.IDomWidget;
		for (var i = 0, length = this._placeholders.length; i < length; ++i) {
			placeholder = this._placeholders[i];
			child = this.children[i];
			placeholder.get('content') !== child && placeholder.set('content', child);
		}
	}
}

export = Element;

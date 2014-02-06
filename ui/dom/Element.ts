import array = require('dojo/_base/array');
import core = require('../../interfaces');
import domConstruct = require('dojo/dom-construct');
import DomContainer = require('./Container');
import domUtil = require('./util');
import lang = require('dojo/_base/lang');
import MultiNodeWidget = require('./MultiNodeWidget');
import Placeholder = require('./Placeholder');
import TemplatingPlaceholder = require('../../templating/html/ui/Placeholder');
import PlacePosition = require('../PlacePosition');
import util = require('../../util');
import widgets = require('../interfaces');

var CHILD_PATTERN:RegExp = /^\s*child#(\d+)\s*$/,
	BINDING_PATTERN:RegExp = /^\s*binding#(\d+)\s*$/;

/**
 * The Element class provides a DOM-specific widget that encapsulates one or more DOM nodes.
 */
class DomElement extends MultiNodeWidget implements widgets.IContainer {
	private _boundTextNodes:Text[];
	private _childSlots:Placeholder[];
	/* protected */ _children:widgets.IDomWidget[];
	/* protected */ _html:string;
	/* protected */ _placeholders:{ [id:string]:widgets.IPlaceholder; };
	private _updatePlaceholders:Function;

	// TODO: TS#2153
	// get(key:'children'):widgets.IDomWidget[];
	// get(key:'html'):string;
	// get(key:'placeholders'):{ [id:string]:widgets.IPlaceholder; };
	// set(key:'children', value:widgets.IDomWidget[]):void;
	// set(key:'html', value:string):void;

	constructor(kwArgs:any) {
		util.deferSetters(this, [ 'html' ], '_render');
		this._children = [];
		this._placeholders = {};
		this._updatePlaceholders = util.debounce(this.__updatePlaceholders);
		super(kwArgs);
	}

	private _childrenSetter(children:widgets.IDomWidget[]):void {
		this._children = children;
		// Loop over children and keep track of all named placeholders
		// TODO: remove placeholders from our list of children
		var child:widgets.IDomWidget,
			name:string;
		for (var i = 0, length = children.length; i < length; ++i) {
			child = children[i];
			name = child.get('name');
			if (name && child instanceof TemplatingPlaceholder) {
				this._placeholders[name] = <TemplatingPlaceholder> child;
			}
		}
		this._updatePlaceholders();
	}

	private _createChildSlot(index:number):DocumentFragment {
		var slot:Placeholder = this._childSlots[index] = new Placeholder({});
		// TODO: Do not touch privates
		return domUtil.getRange(slot._firstNode, slot._lastNode).extractContents();
	}

	private _createTextBinding(index:number, binding:string):Text {
		var textNode:Text = this._boundTextNodes[index] = document.createTextNode('');
		// TODO: might be best to do something like this: this.bind('_boundText.' + index, binding)
		// and then set our text nodes on changes, but NestedProxty isn't cooperating
		// If we can figure this out we can remove the half-baked NodeProxty too
		this.addBinding(this.get('app').get('binder').bind({
			source: this.get('mediator'), // TODO: we may want to cache for long scope lookup chains
			sourceBinding: binding,
			target: textNode,
			targetBinding: 'nodeValue'
		}));
		return textNode;
	}

	destroy():void {
		this._childSlots && array.forEach(this._childSlots, (slot:Placeholder):void => slot.destroy());
		array.forEach(this._children, (child:widgets.IDomWidget):void => child.destroy());
		for (var key in this._placeholders) {
			this._placeholders[key].destroy();
		}
		this._boundTextNodes = this._placeholders = this._children = this._childSlots = null;
		super.destroy();
	}

	private _htmlSetter(html:any):void {
		this._childSlots = [];
		this._boundTextNodes = [];
		this.empty();

		// If html is a string no need to do any fancy processing
		if (typeof html === 'string') {
			this._html = html;
			this._lastNode.parentNode.insertBefore(domConstruct.toDom(html), this._lastNode);
			return;
		}

		var createChildSlot = lang.hitch(this, this._createChildSlot),
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
				newNode = createChildSlot(index);
			}
			// Test for bound text comment marker
			else if (match = node.nodeValue.match(BINDING_PATTERN)) {
				index = Number(match[1]);
				newNode = createTextBinding(index, html[index].binding);
			}
			newNode && parent.replaceChild(newNode, node);
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
		var fragment:Node = domConstruct.toDom(this._html);
		processChildComments(fragment);
		this._lastNode.parentNode.insertBefore(fragment, this._lastNode);
		this._updatePlaceholders();
	}

	private __updatePlaceholders():void {
		// Nothing to do if there are no child placeholders or children
		if (!this._childSlots || !this._children) {
			return;
		}
		// Loop over child placeholder slots and set to associated child widget
		var slot:Placeholder,
			child:widgets.IDomWidget;
		for (var i = 0, length = this._childSlots.length; i < length; ++i) {
			slot = this._childSlots[i];
			child = this._children[i];
			// TODO: any coercion is necessary due to TS#2153 not allowing individual specialized overrides
			if (<any> slot.get('content') !== child) {
				slot.set('content', child);
			}
		}
	}

	// widgets.IContainer
	add:{
		(widget:widgets.IDomWidget, position:PlacePosition):IHandle;
		(widget:widgets.IDomWidget, position:number):IHandle;
		(widget:widgets.IDomWidget, placeholder:string):IHandle;
	};

	// empty:() => void;

	remove:{ (index:number):void; (widget:widgets.IWidget):void; };
}

util.applyMixins(DomElement, [ DomContainer ]);

export = DomElement;

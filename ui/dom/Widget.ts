import dom = require('./interfaces');
import domUtil = require('./util');
import domConstruct = require('dojo/dom-construct');
import has = require('../../has');
import Observable = require('../../Observable');
import PlacePosition = require('../PlacePosition');
import style = require('../style/interfaces');
import ui = require('../interfaces');
import util = require('../../util');

class DomWidgetRenderer implements ui.IRenderer {
	className:string;

	add(widget:dom.IContainer, item:dom.IWidget, reference?:any /* dom.IWidget | Node */, position?:PlacePosition):void {
		item._renderer.detach(item);
		if (reference) {
			if (!(reference && reference.nodeType)) {
				reference = this._getReferenceNode(reference, position);
			}
			// Position item in relation to its reference
			domUtil.place(item._outerFragment, reference, position);
		}
		else {
			// Position item at the very end of the widget
			var firstNode = widget._firstNode,
				lastNode = widget._lastNode;
			if (firstNode === lastNode) {
				firstNode.appendChild(item._outerFragment);
			}
			else {
				firstNode.parentNode.insertBefore(item._outerFragment, lastNode);
			}
		}
	}

	attachContent(widget:dom.IWidget):void {
		var value = widget._innerFragment;
		// Try to detach again if we don't have a content fragment
		if (value && value.firstChild) {
			this.detachContent(widget);
			value = widget._innerFragment;
		}
		if (value && value.firstChild) {
			widget._firstNode.parentNode.insertBefore(widget._innerFragment, widget._lastNode);
		}
		widget._innerFragment = null;
	}

	attachStyles(widget:dom.IWidget):void {
		this.detachStyles(widget);

		widget._styleHandle = widget.style.observe((value:any, previous:any, key:string):void => {
			// We can't hide content so we have to detach for display: none
			if (key === 'display') {
				value === 'none' ? this.detachContent(widget) : this.attachContent(widget);
			}
		});
	}

	attachToWindow(widget:dom.IWidget, target:Node):void {
		target.appendChild(widget._outerFragment);
	}

	clear(widget:dom.IWidget):void {
		// Give children a chance to preserve their content before blowing them away
		this.detachChildren(<dom.IContainer> widget);
		domUtil.deleteRange(widget._firstNode, widget._lastNode, true);
	}

	destroy(widget:dom.IWidget):void {
		this.detachStyles(widget);
		this.detach(widget);
		widget._classListHandle = widget._styleHandle = null;
		widget._firstNode = widget._lastNode = null;
		widget._innerFragment = widget._outerFragment = null;
	}

	detach(widget:dom.IWidget):void {
		var fragment = widget._outerFragment;
		if (!fragment || !fragment.firstChild) {
			widget._outerFragment = domUtil.extractRange(widget._firstNode, widget._lastNode);
		}
	}

	detachChildren(widget:dom.IContainer):void {
		var children = <dom.IWidget[]> widget.get('children');
		if (children) {
			for (var i = 0, child:dom.IWidget; (child = children[i]); ++i) {
				child._renderer.detachContent(child);
			}
		}
	}

	detachContent(widget:dom.IWidget):void {
		var content = widget._innerFragment;
		if (!content || !content.firstChild) {
			widget._innerFragment = domUtil.extractRange(widget._firstNode, widget._lastNode, true);
		}
	}

	detachStyles(widget:dom.IWidget):void {
		util.remove(widget._classListHandle);
		util.remove(widget._styleHandle);
	}

	/* protected */ _getReferenceNode(reference:dom.IWidget, position:PlacePosition = PlacePosition.LAST) {
		if (position === PlacePosition.FIRST || position === PlacePosition.BEFORE) {
			return reference._firstNode;
		}
		if (position === PlacePosition.LAST || position === PlacePosition.AFTER) {
			return reference._lastNode;
		}
		if (has('debug')) {
			// TODO: reference.detach() and return outerFragment instead?
			throw new Error('Reference widget cannot be provided with PlacePosition ' + position);
		}
	}

	initialize(widget:dom.IWidget):void {
	}

	remove(widget:dom.IContainer, item:dom.IWidget):void {
		item._renderer.detach(item);
	}

	render(widget:dom.IWidget):void {
		var commentId:string = ((<any> widget.constructor).name || '') + '#' + widget.get('id').replace(/--/g, '\u2010\u2010');

		var firstNode = widget._firstNode = document.createComment(commentId),
			lastNode = widget._lastNode = document.createComment('/' + commentId),
			fragment = widget._outerFragment = document.createDocumentFragment();

		fragment.appendChild(firstNode);
		fragment.appendChild(lastNode);
		this.attachStyles(widget);
	}

	setContent(widget:dom.IWidget, value?:any /* string | Node */):void {
		this.clear(widget);
		widget._innerFragment = domUtil.toDom(value);
		this.attachContent(widget);
	}
}

DomWidgetRenderer.prototype.className = '';

export = DomWidgetRenderer;

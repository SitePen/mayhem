import dom = require('./interfaces');
import domUtil = require('./util');
import domConstruct = require('dojo/dom-construct');
import Observable = require('../../Observable');
import PlacePosition = require('../PlacePosition');
import style = require('../style/interfaces');
import ui = require('../interfaces');
import util = require('../../util');

class DomWidgetRenderer implements ui.IRenderer {
	add(widget:dom.IContainer, item:dom.IWidget, reference?:any /* dom.IWidget | Node */):void {
		item._renderer.detach(item);
		if (reference instanceof Node) {
			// Replace provided reference node with item
			domUtil.place(item._outerFragment, reference, PlacePosition.REPLACE);
		}
		else {
			// Add item just before reference node, if any, or to the very end of the widget
			widget._firstNode.parentNode.insertBefore(item._outerFragment, reference && reference._firstNode || widget._lastNode);
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

		widget._styleHandle = widget.get('style').observe((value:any, previous:any, key:string):void => {
			// We can't hide content so we detach it on display: none
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
		domUtil.getRange(widget._firstNode, widget._lastNode, true).deleteContents();
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
			widget._outerFragment = domUtil.getRange(widget._firstNode, widget._lastNode).extractContents();
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
			widget._innerFragment = domUtil.getRange(widget._firstNode, widget._lastNode, true).extractContents();	
		}
	}

	detachStyles(widget:dom.IWidget):void {
		util.remove(widget._classListHandle);
		util.remove(widget._styleHandle);
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

export = DomWidgetRenderer;
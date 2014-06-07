import _BaseRenderer = require('./_Base');
import dom = require('./interfaces');
import domUtil = require('./util');
import has = require('../../has');
import util = require('../../util');

class _FragmentRenderer extends _BaseRenderer {
	attachContent(widget:dom.IFragmentWidget):void {
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

	attachStyles(widget:dom.IFragmentWidget):void {
		this._detachStyles(widget);

		// Poison classList and style instances since they're effectively useless
		widget._classListHandle = widget.classList.observe((value:string):void => {
			has('debug') && console.debug('Cannot set class on fragment-rendered widget');
		});

		widget._styleHandle = widget.style.observe((value:any, previous:any, key:string):void => {
			has('debug') && console.debug('Cannot set style on fragment-rendered widget');
		});
	}

	clear(widget:dom.IFragmentWidget):void {
		// Give children a chance to preserve their content before blowing them away
		this._detachChildren(<dom.IContainer> widget);
		domUtil.deleteRange(widget._firstNode, widget._lastNode, true);
	}

	detach(widget:dom.IFragmentWidget):void {
		var fragment = widget._outerFragment;
		if (!fragment || !fragment.firstChild) {
			widget._outerFragment = domUtil.extractRange(widget._firstNode, widget._lastNode);
		}
	}

	detachContent(widget:dom.IFragmentWidget):void {
		var content = widget._innerFragment;
		if (!content || !content.firstChild) {
			widget._innerFragment = domUtil.extractRange(widget._firstNode, widget._lastNode, true);
		}
	}

	render(widget:dom.IFragmentWidget):void {
		var name = (<any> widget.constructor).name || '',
			commentId:string = name + '#' + widget.get('id').replace(/--/g, '\u2010\u2010'),
			firstNode = widget._firstNode = document.createComment(commentId),
			lastNode = widget._lastNode = document.createComment('/' + commentId),
			fragment = widget._outerFragment = document.createDocumentFragment();

		fragment.appendChild(firstNode);
		fragment.appendChild(lastNode);
	}

	setContent(widget:dom.IFragmentWidget, value?:any /* string | Node */):void {
		var fragment:DocumentFragment;
		value = domUtil.toDom(value);

		// If we just have text node make a fragment out of it
		if (value instanceof Text) {
			fragment = document.createDocumentFragment();
			fragment.appendChild(value);
		}
		else {
			fragment = value;
		}

		this.clear(widget);
		widget._innerFragment = fragment;
		if (!widget.get('hidden')) {
			this.attachContent(widget);
		}
	}

	updateVisibility(widget:dom.IFragmentWidget, value:boolean):void {
		value ? this.attachContent(widget) : this.detachContent(widget);
	}
}

export = _FragmentRenderer;

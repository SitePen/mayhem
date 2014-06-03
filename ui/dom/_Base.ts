import dom = require('./interfaces');
import domUtil = require('./util');
import domConstruct = require('dojo/dom-construct');
import has = require('../../has');
import Observable = require('../../Observable');
import PlacePosition = require('../PlacePosition');
import query = require('dojo/query');
import style = require('../style/interfaces');
import ui = require('../interfaces');
import util = require('../../util');

class _BaseRenderer implements ui.IRenderer {
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

	attachContent(widget:dom.IWidget):void {}

	attachRole(widget:dom.IWidget):void {}

	attachStyles(widget:dom.IWidget):void {}

	attachToWindow(widget:dom.IWidget, target:any):void {
		if (target == null) {
			target = document.body;
		}
		else if (typeof target === 'string') {
			target = query(target)[0];
		}
		target.appendChild(widget._outerFragment);
	}

	clear(widget:dom.IWidget):void {}

	destroy(widget:dom.IWidget):void {
		this._detachRole(widget);
		this._detachStyles(widget);
		
		this.detach(widget);
		widget._classListHandle = widget._styleHandle = null;
		widget._firstNode = widget._lastNode = null;
		widget._innerFragment = widget._outerFragment = null;
		widget = null;
	}

	detach(widget:dom.IWidget):void {}

	/* protected */ _detachRole(widget:dom.IWidget):void {
		util.remove.apply(null, widget._actionHandles);
	}

	/* protected */ _detachStyles(widget:dom.IWidget):void {
		util.remove(widget._classListHandle, widget._styleHandle);
	}

	/* protected */ _detachChildren(widget:dom.IContainer):void {
		var children = <dom.IWidget[]> widget.get('children');
		if (children) {
			for (var i = 0, child:dom.IWidget; (child = children[i]); ++i) {
				child._renderer.detachContent(child);
			}
		}
	}

	detachContent(widget:dom.IWidget):void {}

	private _getReferenceNode(reference:dom.IWidget, position:PlacePosition = PlacePosition.LAST) {
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

	trigger(widget:dom.IElementWidget, actionName:string, source?:Event):void {
		var roleConfig = this['_' + widget.get('role') + 'Actions'],
			action = roleConfig && roleConfig[actionName];

		if (action) {
			action.trigger(widget, source);
		}
		else if (has('debug')) {
			console.debug('No action handler for: ' + actionName);
		}
	}

	initialize(widget:dom.IWidget):void {}

	remove(widget:dom.IContainer, item:dom.IWidget):void {
		item._renderer.detach(item);
	}

	render(widget:dom.IWidget):void {}

	setContent(widget:dom.IWidget, value?:any /* string | Node */):void {}

	updateVisibility(widget:dom.IWidget, value:boolean):void {}
}

_BaseRenderer.prototype.className = '';

export = _BaseRenderer;

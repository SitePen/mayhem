import array = require('dojo/_base/array');
import domUtil = require('./util');
import List = require('dgrid/List');
import OnDemandList = require('dgrid/OnDemandList');
import ui = require('../interfaces');
import util = require('../../util');
import Widget = require('./Widget');

class Conditional extends Widget {
	add(widget:ui.IConditionalImpl, item:ui.IWidgetImpl, position?:any):IHandle {
		var handle:IHandle;
		if (!position) {
			// To be sure to include new widget in consequent node we detach and then reattach it
			var detached:boolean;
			if (widget._impl.consequentNode) {
				detached = true;
				this._attachConsequent(widget);
			}
			// Create a reference node just before alternate boundary and place child there
			var referenceNode:Comment = document.createComment('child marker');
			widget._impl.firstNode.parentNode.insertBefore(referenceNode, widget._impl.boundaryNode);
			handle = super.add(widget, item, referenceNode);
			referenceNode = null;
			if (detached) {
				this._detachConsequent(widget);
			}
			return handle;
		}
		return super.add(widget, item, position);
	}

	private _attachAlternate(widget:ui.IConditionalImpl):void {
		var alternate = widget.get('alternate');
		if (alternate) {
			alternate.detach();
			// TODO: alternate.get('fragment')?
			widget._impl.firstNode.parentNode.insertBefore(alternate._impl.fragment, widget._impl.lastNode);
			alternate.set('attached', widget.get('attached'));
		}
	}

	private _attachConsequent(widget:ui.IConditionalImpl):void {
		if (widget._impl.consequentNode) {
			widget._impl.firstNode.parentNode.insertBefore(widget._impl.consequentNode, widget._impl.boundaryNode);
			widget._impl.consequentNode = null;
		}
	}

	detach(widget:ui.IConditionalImpl):void {
		this._detachAlternate(widget);
		super.detach(widget);
	}

	private _detachAlternate(widget:ui.IConditionalImpl):void {
		var alternate = widget.get('alternate');
		alternate && alternate.detach();
	}

	private _detachConsequent(widget:ui.IConditionalImpl):void {
		if (widget._impl.consequentNode) {
			return;
		}
		widget._impl.consequentNode = domUtil.getRange(widget._impl.firstNode, widget._impl.boundaryNode, true).extractContents();
	}

	render(widget:ui.IConditionalImpl):void {
		super.render(widget);
		widget._impl.boundaryNode = document.createComment('alternate boundary - ' + widget.get('id'));
		widget._impl.firstNode.parentNode.insertBefore(widget._impl.boundaryNode, widget._impl.lastNode);

		widget.observe('attached', (attached:boolean) => {
			if (attached) {
				this._selectContent(widget);
			}
		});
		widget.observe('result', () => {
			if (widget.get('attached')) {
				this._selectContent(widget);
			}
		});
	}

	private _selectContent(widget:ui.IConditionalImpl):void {
		this._detachAlternate(widget);
		if (widget.get('result')) {
			this._attachConsequent(widget);
		}
		else {
			this._detachConsequent(widget);
			this._attachAlternate(widget);
		}
	}
}

export = Conditional;

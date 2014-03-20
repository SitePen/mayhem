import array = require('dojo/_base/array');
import dom = require('./interfaces');
import domUtil = require('./util');
import DomWidgetRenderer = require('./Widget');
import List = require('dgrid/List');
import OnDemandList = require('dgrid/OnDemandList');
import util = require('../../util');

class ConditionalRenderer extends DomWidgetRenderer {
	add(widget:dom.IConditional, item:dom.IWidget, position?:any):IHandle {
		// Add child widgets just before boundary node
		var handle:IHandle, // TODO
			detached:boolean;

		// To be sure to include new widget in consequent node we detach and then reattach it
		if (widget._consequentNode) {
			detached = true;
			this._attachConsequent(widget);
		}
		// Place child just before the alternate boundary
		item.detach();
		widget._firstNode.parentNode.insertBefore(item._fragment, widget._boundaryNode);
		if (detached) {
			this._detachConsequent(widget);
		}
		return handle;
	}

	private _attachAlternate(widget:dom.IConditional):void {
		var alternate = widget.get('alternate');
		if (alternate) {
			alternate.detach();
			// TODO: alternate.get('fragment')?
			widget._firstNode.parentNode.insertBefore(alternate._fragment, widget._lastNode);
			alternate.set('attached', widget.get('attached'));
		}
	}

	private _attachConsequent(widget:dom.IConditional):void {
		if (widget._consequentNode) {
			widget._firstNode.parentNode.insertBefore(widget._consequentNode, widget._boundaryNode);
			widget._consequentNode = null;
		}
	}

	detach(widget:dom.IConditional):void {
		this._detachAlternate(widget);
		super.detach(widget);
	}

	private _detachAlternate(widget:dom.IConditional):void {
		var alternate = widget.get('alternate');
		alternate && alternate.detach();
	}

	private _detachConsequent(widget:dom.IConditional):void {
		if (widget._consequentNode) {
			return;
		}
		widget._consequentNode = domUtil.getRange(widget._firstNode, widget._boundaryNode, true).extractContents();
	}

	initialize(widget:dom.IConditional):void {
		widget.observe('attached', (attached:boolean):void => {
			if (attached) {
				this._selectContent(widget);
			}
		});
		widget.observe('content', (content:Node):void => {
			widget._consequentNode = content;
		});
		widget.observe('result', ():void => {
			if (widget.get('attached')) {
				this._selectContent(widget);
			}
		});
	}

	render(widget:dom.IConditional):void {
		super.render(widget);
		widget._boundaryNode = document.createComment('alternate boundary - ' + widget.get('id'));
		widget._firstNode.parentNode.insertBefore(widget._boundaryNode, widget._lastNode);
	}

	private _selectContent(widget:dom.IConditional):void {
		var result = widget.get('result');
		if (result === undefined) {
			return;
		}
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

export = ConditionalRenderer;

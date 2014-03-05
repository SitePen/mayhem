/// <reference path="../../../dojo" />

import array = require('dojo/_base/array');
import core = require('../../../interfaces');
import domUtil = require('../../../ui/dom/util');
import Placeholder = require('../../../ui/dom/Placeholder');
import ui = require('../../../ui/interfaces');
import util = require('../../../util');
import ViewWidget = require('../../../ui/dom/ViewWidget');

class Conditional extends ViewWidget {
	private _active:boolean;
	private _alternate:ui.IDomWidget;
	private _boundaryNode:Node;
	private _condition:string;
	private _consequentNode:Node;
	private _debounceRate:number = 1;
	private _listenHandle:IHandle;
	private _mediatorHandle:IHandle;

	constructor(kwArgs:any) {
		super(kwArgs);
		this._mediatorHandle = this.observe('mediator', this._listen);
	}

	private _activeSetter(active:boolean) {
		this._selectContent(active);
	}

	add(widget:ui.IDomWidget, position?:any, referenceNode?:Node):IHandle {
		var handle:IHandle;
		if (!referenceNode) {
			// To be sure to include new widget in consequent node we detach and then reattach it
			var detached:boolean;
			if (this._consequentNode) {
				detached = true;
				this._attachConsequent();
			}
			// Create a reference node just before alternate boundary and place child there
			referenceNode = document.createComment('child marker ' + position);
			this._firstNode.parentNode.insertBefore(referenceNode, this._boundaryNode);
			handle = super.add(widget, position, referenceNode);
			referenceNode = null;
			if (detached) {
				this._detachConsequent();
			}
			return handle;
		}
		return super.add(widget, position, referenceNode);
	}

	private _alternateSetter(alternate:ui.IDomWidget):void {
		// TODO: if there was a previous alternate clean it up
		this._alternate = alternate;
		alternate.set('parent', this);
	}

	private _attachAlternate():void {
		var alternate:Conditional = <Conditional> this._alternate;
		if (alternate) {
			this._firstNode.parentNode.insertBefore(alternate.detach(), this._lastNode);
			alternate._evaluate && alternate._evaluate();
		}
	}

	private _attachConsequent():void {
		if (this._consequentNode) {
			this._firstNode.parentNode.insertBefore(this._consequentNode, this._boundaryNode);
			this._consequentNode = null;
		}
	}

	private _debounceRateSetter(value:number):void {
		this._debounceRate = value;
		this._listen();
	}

	private _listen():void {
		var mediator = this.get('mediator');
		if (mediator) {
			this._listenHandle && this._listenHandle.remove();
			this._listenHandle = mediator.observe(this._condition, util.debounce((value:boolean):void => {
				this._evaluate();
			}, this._debounceRate));
			this._evaluate();
		}
	}

	destroy():void {
		this._listenHandle && this._listenHandle.remove();
		this._mediatorHandle && this._mediatorHandle.remove();
	}

	detach():Node {
		this._detachAlternate();
		return super.detach();
	}

	private _detachAlternate():void {
		if (this._alternate) {
			this._alternate.detach();
		}
	}

	private _detachConsequent():void {
		if (this._consequentNode) {
			return;
		}
		this._consequentNode = domUtil.getRange(this._firstNode, this._boundaryNode, true).extractContents();
	}

	/* protected */ _evaluate():void {
		var mediator = this.get('mediator');
		if (mediator) {
			this.set('active', !!this.get('mediator').get(this._condition));
		}
	}

	/* protected */ _render():void {
		super._render();
		this._boundaryNode = document.createComment('alternate boundary - ' + this.get('id'));
		this._firstNode.parentNode.insertBefore(this._boundaryNode, this._lastNode);
	}

	/* protected */ _renderContent():void {
		this._consequentNode = this._content;
		this._content = null;
	}

	private _selectContent(active:boolean):void {
		this._detachAlternate();
		if (active) {
			this._attachConsequent();
		}
		else {
			this._detachConsequent();
			this._attachAlternate();
		}
	}
}

export = Conditional;

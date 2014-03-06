/// <reference path="../../../dojo" />

import array = require('dojo/_base/array');
import core = require('../../../interfaces');
import domUtil = require('../../../ui/dom/util');
import Placeholder = require('../../../ui/dom/Placeholder');
import ui = require('../../../ui/interfaces');
import util = require('../../../util');
import ViewWidget = require('../../../ui/dom/ViewWidget');

class Conditional extends ViewWidget {
	private _alternate:ui.IDomWidget;
	private _bindHandle:IHandle;
	private _boundaryNode:Node;
	private _condition:string;
	private _consequentNode:Node;
	private _result:boolean;

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

	/* protected */ _attachedSetter(attached:boolean):void {
		super._attachedSetter(attached);
		if (attached) {
			this._selectContent(this._result);
		}
	}

	private _attachAlternate():void {
		var alternate:Conditional = <Conditional> this._alternate;
		if (alternate) {
			this._firstNode.parentNode.insertBefore(alternate.getNode(), this._lastNode);
			alternate.set('attached', this.get('attached'));
		}
	}

	private _attachConsequent():void {
		if (this._consequentNode) {
			this._firstNode.parentNode.insertBefore(this._consequentNode, this._boundaryNode);
			this._consequentNode = null;
		}
	}

	/* protected */ _conditionSetter(condition:string) {
		this._condition = condition;
		this._bindHandle && this._bindHandle.remove();
		this._bindHandle = this.bind('result', condition);
	}

	destroy():void {
		this._bindHandle && this._bindHandle.remove();
		this._alternate.destroy();
		this._bindHandle = this._alternate = this._boundaryNode = this._consequentNode = null
	}

	detach():void {
		this._detachAlternate();
		super.detach();
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

	/* protected */ _render():void {
		super._render();
		this._boundaryNode = document.createComment('alternate boundary - ' + this.get('id'));
		this._firstNode.parentNode.insertBefore(this._boundaryNode, this._lastNode);
	}

	/* protected */ _renderContent():void {
		this._consequentNode = this._content;
		this._content = null;
	}

	private _resultSetter(result:boolean) {
		this._result = result;
		if (this.get('attached')) {
			this._selectContent(result);
		}
	}

	private _selectContent(consequent:boolean):void {
		this._detachAlternate();
		if (consequent) {
			this._attachConsequent();
		}
		else {
			this._detachConsequent();
			this._attachAlternate();
		}
	}
}

export = Conditional;

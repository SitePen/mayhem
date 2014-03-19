/// <reference path="../../../dojo" />

import array = require('dojo/_base/array');
import core = require('../../../interfaces');
import domUtil = require('../../../ui/dom/util');
import Placeholder = require('../../../ui/Placeholder');
import templating = require('./interfaces');
import ui = require('../../../ui/interfaces');
import util = require('../../../util');
import View = require('../../../ui/View');

class Conditional extends View implements templating.IConditional {
	private _alternate:ui.IWidget;
	private _bindHandle:IHandle;
	private _condition:string;
	private _result:boolean;

	// Typescript, wut?
	private _boundaryNode:Comment;
	private _consequentNode:Node;

	get:templating.IConditionalGet;
	set:templating.IConditionalSet;

	add(item:ui.IWidget, position?:any):IHandle {
		var handle:IHandle;
		if (!position) {
			// To be sure to include new widget in consequent node we detach and then reattach it
			var detached:boolean;
			if (this._consequentNode) {
				detached = true;
				this._attachConsequent();
			}
			// Create a reference node just before alternate boundary and place child there
			var referenceNode:Comment = document.createComment('child marker');
			this.get('firstNode').parentNode.insertBefore(referenceNode, this._boundaryNode);
			handle = super.add(item, referenceNode);
			referenceNode = null;
			if (detached) {
				this._detachConsequent();
			}
			return handle;
		}
		return super.add(item, position);
	}

	private _alternateSetter(alternate:ui.IWidget):void {
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
			alternate.detach();
			this.get('firstNode').parentNode.insertBefore(alternate.get('fragment'), this.get('lastNode'));
			alternate.set('attached', this.get('attached'));
		}
	}

	private _attachConsequent():void {
		if (this._consequentNode) {
			this.get('firstNode').parentNode.insertBefore(this._consequentNode, this._boundaryNode);
			this._consequentNode = null;
		}
	}

	/* protected */ _conditionSetter(condition:string) {
		this._condition = condition;
		this._bindHandle && this._bindHandle.remove();
		this._bindHandle = this.bind({
			sourceBinding: condition,
			targetBinding: 'result'
		});
	}

	/* protected */ _contentSetter(content:Node):void {
		this._consequentNode = content;
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
		this._consequentNode = domUtil.getRange(this.get('firstNode'), this._boundaryNode, true).extractContents();
	}

	/* protected */ _render():void {
		// TODO: to renderer
		super._render();
		this._boundaryNode = document.createComment('alternate boundary - ' + this._impl.id);
		this._impl.firstNode.parentNode.insertBefore(this._boundaryNode, this._impl.lastNode);
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

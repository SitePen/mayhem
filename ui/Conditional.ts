/// <amd-dependency path="./renderer!Conditional" />

import Placeholder = require('./Placeholder');
import ui = require('./interfaces');
import util = require('../util');
import View = require('./View');

var Renderer:any = require('./renderer!Conditional');

class Conditional extends Placeholder implements ui.IConditional {
	private _conditionBindHandle:IHandle;
	/* protected */ _values:ui.IConditionalValues;

	get:ui.IConditionalGet;
	set:ui.IConditionalSet;

	// Forward add calls to consequent widget
	add(item:ui.IWidget, position?:any):IHandle {
		return this.get('consequent').add(item, position);
	}

	// Forward set content calls to consequent widget
	/* protected */ _contentSetter(content:any):void {
		this.get('consequent').set('content', content);
	}

	destroy():void {
		this.own(this.get('alternate'));
		util.remove(this._conditionBindHandle);
		this._conditionBindHandle = null;
	}

	detach():void {
		this.get('consequent').detach();
		super.detach();
	}

	/* protected */ _initialize():void {
		super._initialize();

		this.set('consequent', new View());

		this.observe('attached', (attached:boolean):void => {
			if (attached) {
				this._selectWidget();
			}
		});

		this.observe('result', ():void => {
			if (this.get('attached')) {
				this._selectWidget();
			}
		});

		this.observe('alternate', (alternate:ui.IWidget, previous:ui.IWidget):void => {
			util.destroy(previous);
			alternate.set('parent', this);
			this._selectWidget();
		});

		this.observe('condition', (condition:string):void => {
			util.remove(this._conditionBindHandle);
			this._conditionBindHandle = this.bind({
				sourceBinding: condition,
				targetBinding: 'result'
			});
		});
	}

	private _selectWidget():void {
		var result = this.get('result');
		// Noop if we haven't been evaluated yet
		if (result === undefined) {
			return;
		}
		this.set('widget', this.get(result ? 'consequent' : 'alternate' ));
		// Force placeholder to render widget
		this._placeWidget();
	}
}

Conditional.prototype._renderer = new Renderer();

export = Conditional;

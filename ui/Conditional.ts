/// <amd-dependency path="./renderer!Conditional" />

import ui = require('./interfaces');
import util = require('../util');
import View = require('./View');

var Renderer:any = require('./renderer!Conditional');

class Conditional extends View implements ui.IConditional {
	private _conditionBindHandle:IHandle;
	/* protected */ _values:ui.IConditionalValues;

	get:ui.IConditionalGet;
	set:ui.IConditionalSet;

	add(item:ui.IWidget, position?:any):IHandle {
		// Forward view-specific calls to consequent widget
		return this.get('consequent').add(item, position);
	}

	/* protected */ _initialize():void {
		super._initialize();

		this.observe('alternate', this._placeView);
		this.observe('consequent', this._placeView);

		this.set('consequent', new View());

		this.observe('result', (result:boolean):void => {
			this._updateVisibility(result);
		});

		this.observe('condition', (condition:string):void => {
			util.remove(this._conditionBindHandle);
			this._conditionBindHandle = this.bind({
				sourceBinding: condition,
				targetBinding: 'result'
			});
		});
	}

	remove(index:any):void {
		// Forward view-specific calls to consequent widget
		return this.get('consequent').remove(index);
	}

	private _placeView(view:ui.IWidget, previous:ui.IWidget):void {
		if(!view && !previous) {
			return;
		}
		// Defer until rendered
		if (!this.get('rendered')) {
			this.observe('rendered', () => {
				this._placeView(view, previous);
			});
			return;
		}

		var index:number;
		if (previous) {
			index = previous.get('index');
			previous.destroy();
			previous = null;
		}
		view && super.add(view, index >= 0 ? index : null);
		this._updateVisibility(this.get('result'));
	}

	setContent(content:any):void {
		// Forward view-specific calls to consequent widget
		this.get('consequent').setContent(content);
	}

	private _updateVisibility(result:boolean):void {
		if (result == null) {
			return;
		}
		var consequent = this.get('consequent'),
			alternate = this.get('alternate');
		consequent && consequent.set('visible', result);
		alternate && alternate.set('visible', !result);
	}
}

Conditional.prototype._renderer = new Renderer();

export = Conditional;

/// <amd-dependency path="./renderer!Conditional" />

import ui = require('./interfaces');
import util = require('../util');
import ContentView = require('./ContentView');

var Renderer:any = require('./renderer!Conditional');

class Conditional extends ContentView implements ui.IConditional {
	private _conditionBindHandle:IHandle;

	_alternate:ui.IWidget;
	_condition:string;
	_consequent:ui.IContentView;
	_result:boolean;

	get:ui.IConditionalGet;
	set:ui.IConditionalSet;

	constructor(kwArgs:any = {}) {
		this._deferProperty('alternate', '_render');
		this._deferProperty('consequent', '_render');

		// Create default consequent view if none provided
		kwArgs.consequent || (kwArgs.consequent = new ContentView());

		super(kwArgs);
	}

	add(item:ui.IWidget, position?:any):IHandle {
		// Forward to consequent view
		return this._consequent.add(item, position);
	}

	_alternateChanged(view:ui.IWidget, previous:ui.IWidget):void {
		this._placeView(view, previous);
	}

	_conditionChanged(condition:string):void {
		util.remove(this._conditionBindHandle);
		this._conditionBindHandle = this.bind({
			sourceBinding: condition,
			targetBinding: 'result'
		});
	}

	_consequentChanged(view:ui.IWidget, previous:ui.IWidget):void {
		this._placeView(view, previous);
	}

	remove(index:any):void {
		// Forward to consequent view
		if (this.getChildIndex(index) !== -1) {
			return super.remove(index);
		}
		return this._consequent.remove(index);
	}

	_resultChanged(result:boolean):void {
		this._updateVisibility(result);
	}

	private _placeView(view:ui.IWidget, previous:ui.IWidget):void {
		if (!view && !previous) {
			return;
		}

		var index:number;
		if (previous) {
			index = previous.get('index');
			previous.destroy();
			previous = null;
		}
		if (view) {
			super.add(view, index >= 0 ? index : null);
		}
		this._updateVisibility(this.get('result'));
	}

	setContent(content:any):void {
		// Forward to consequent view
		this._consequent.setContent(content);
	}

	private _updateVisibility(result:boolean):void {
		if (!this._consequent) {
			return;
		}
		this._consequent.set('hidden', !result);
		this._alternate && this._alternate.set('hidden', !!result);
	}
}

Conditional.prototype._renderer = new Renderer();

export = Conditional;

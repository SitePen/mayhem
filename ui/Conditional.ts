/// <amd-dependency path="./renderer!Conditional" />

import ui = require('./interfaces');
import View = require('./View');

var Renderer:any = require('./renderer!Conditional');

class Conditional extends View implements ui.IConditional {
	private _bindHandle:IHandle;
	/* protected */ _values:ui.IConditionalValues;

	get:ui.IConditionalGet;
	set:ui.IConditionalSet;

	destroy():void {
		this._bindHandle && this._bindHandle.remove();
		this._bindHandle = null;
	}

	/* protected */ _initialize():void {
		super._initialize();
		this.observe('alternate', (alternate:ui.IWidget, previous:ui.IWidget):void => {
			previous && alternate.destroy();
			alternate.set('parent', this);
			//this.attach(alternate);
		});
		this.observe('condition', (condition:string):void => {
			this._bindHandle && this._bindHandle.remove();
			this._bindHandle = this.bind({
				sourceBinding: condition,
				targetBinding: 'result'
			});
		});
	}
}

Conditional.prototype._renderer = new Renderer();

export = Conditional;

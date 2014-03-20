/// <amd-dependency path="./renderer!Conditional" />

import ui = require('./interfaces');
import View = require('./View');

var Renderer:any = require('./renderer!Conditional');

class Conditional extends View implements ui.IConditional {
	private _bindHandle:IHandle;
	/* protected */ _values:ui.IConditionalValues;

	// TODO: _impl?
	// boundaryNode:Comment;
	// consequentNode:Node;

	get:ui.IConditionalGet;
	set:ui.IConditionalSet;

	private _alternateSetter(alternate:ui.IWidget):void {
		// TODO: if there was a previous alternate clean it up
		this._values.alternate = alternate;
		alternate.set('parent', this);
	}

	/* protected */ _conditionSetter(condition:string) {
		this._values.condition = condition;
		this._bindHandle && this._bindHandle.remove();
		this._bindHandle = this.bind({
			sourceBinding: condition,
			targetBinding: 'result'
		});
	}

	/* protected */ _contentSetter(content:Node):void {
		this._impl.consequentNode = content;
	}

	destroy():void {
		this._bindHandle && this._bindHandle.remove();
		this._values.alternate && this._values.alternate.destroy();
		// TODO: finish
		// this._bindHandle = this._alternate = this._boundaryNode = this._consequentNode = null;
	}
}

export = Conditional;

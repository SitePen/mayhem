/// <amd-dependency path="./renderer!Dialog" />

import ContentView = require('./ContentView');
import ui = require('./interfaces');
//import Widget = require('./Widget');

var Renderer:any = require('./renderer!Dialog');

class Dialog extends /*Widget*/ ContentView implements ui.IDialog {
	constructor(kwArgs?:any) {
		this._deferProperty('closable', '_render');
		super(kwArgs);
	}
	get:ui.IDialogGet;
	set:ui.IDialogSet;
}

Dialog.prototype.className = 'dialog';
Dialog.prototype._renderer = new Renderer();

export = Dialog;

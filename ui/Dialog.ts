/// <amd-dependency path="./renderer!Dialog" />

import ContentView = require('./ContentView');
import ui = require('./interfaces');
//import Widget = require('./Widget');

var Renderer:any = require('./renderer!Dialog');

class Dialog extends ContentView implements ui.IDialog {
	get:ui.IDialogGet;
	set:ui.IDialogSet;
}

Dialog.defaults({ role: 'dialog' });
Dialog.set('hidden', true);

Dialog.prototype._renderer = new Renderer();

export = Dialog;

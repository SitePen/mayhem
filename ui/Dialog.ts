/// <amd-dependency path="./renderer!Dialog" />

import ContentView = require('./ContentView');
import ui = require('./interfaces');

var Renderer:any = require('./renderer!Dialog');

class Dialog extends ContentView implements ui.IDialog {
	get:ui.IDialogGet;
	set:ui.IDialogSet;
}

Dialog.set({
	role: 'dialog',
	hidden: true
});

Dialog.prototype._renderer = new Renderer();

export = Dialog;

/// <amd-dependency path="./renderer!Layout" />

import ContentView = require('./ContentView');
import ui = require('./interfaces');

var Renderer:any = require('./renderer!Layout');

class Layout extends ContentView implements ui.ILayout {
	get:ui.ILayoutGet;
	set:ui.ILayoutSet;
}

Layout.prototype._renderer = new Renderer();

export = Layout;

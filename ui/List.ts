/// <amd-dependency path="./renderer!List" />

import core = require('../interfaces');
import ui = require('./interfaces');
import View = require('./View');

var Renderer:any = require('./renderer!List');

class List extends View implements ui.IList {
	get:ui.IListGet;
	set:ui.IListSet;
}

List.prototype._renderer = new Renderer();

export = List;

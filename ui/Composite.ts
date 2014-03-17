import ui = require('./interfaces');
import util = require('../util');
import View = require('./View');

class Composite extends View implements ui.IComposite {
	get:ui.ICompositeGet;
	set:ui.ICompositeGet;
}

export = Composite;

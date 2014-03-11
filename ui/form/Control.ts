import configure = require('../dijit/configure');
import Element = require('../Element');
import form = require('./interfaces');
import lang = require('dojo/_base/lang');
import _Renderer = require('../dijit/_Renderer');

/* abstract */ class Control extends Element implements form.IControl {
	/* protected */ __dijitConfig:any;

	get:form.IControlGet;
	set:form.IControlSet;
}

configure(Control, {
	rename: {
		tabIndex: 'tabindex'
	}
});

Control.prototype._renderer = new _Renderer();

export = Control;

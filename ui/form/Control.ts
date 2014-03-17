import configure = require('../dijit/util/configure');
import dijit = require('../dijit/interfaces');
import DijitRenderer = require('../dijit/util/Renderer');
import Element = require('../Element');
import form = require('./interfaces');
import lang = require('dojo/_base/lang');

/* abstract */ class Control extends Element implements form.IControl {
	/* protected */ _dijit:dijit._WidgetBase;
	/* protected */ _dijitConfig:dijit.IDijitConfiguration;

	get:form.IControlGet;
	set:form.IControlSet;
}

configure(Control, {
	rename: {
		tabIndex: 'tabindex'
	}
});

Control.prototype._renderer = new DijitRenderer();

export = Control;

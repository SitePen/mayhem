import configure = require('./util/configure');
import dijit = require('./interfaces');
import DijitRenderer = require('./util/Renderer');
import Element = require('../Element');

/* abstract */ class _WidgetBase extends Element implements dijit.IWidgetBase {
	/* protected */ _dijit:dijit._WidgetBase;
	/* protected */ _dijitConfig:dijit.IDijitConfiguration;

	get:dijit.IWidgetBaseGet;
	set:dijit.IWidgetBaseSet;
}

configure(_WidgetBase, {
	schema: {
		lang: String,
		dir: String,
		'class': String,
		style: String,
		title: String,
		tooltip: String
	}
});

_WidgetBase.prototype._renderer = new DijitRenderer();

export = _WidgetBase;

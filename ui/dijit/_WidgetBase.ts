import configure = require('./configure');
import dijit = require('./interfaces');
import DijitRenderer = require('./_Renderer');
import Element = require('../Element');

class _WidgetBase extends Element implements dijit.IWidgetBase {
	/* protected */ __dijitConfig:any;

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

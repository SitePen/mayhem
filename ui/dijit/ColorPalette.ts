import configure = require('./configure');
import dijit = require('./interfaces');
import Dijit = require('dijit/ColorPalette');
import _Widget = require('./_Widget');

class ColorPalette extends _Widget {
	// TODO: intefaces
}

configure(ColorPalette, {
	Base: _Widget,
	Dijit: Dijit,
	schema: {
		palette: String
	}
});

export = ColorPalette;

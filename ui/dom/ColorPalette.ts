import __ColorPalette = require('dijit/ColorPalette');
import DijitWidget = require('./DijitWidget');

class ColorPalette extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__ColorPalette);
		super(kwArgs);
	}
}

export = ColorPalette;

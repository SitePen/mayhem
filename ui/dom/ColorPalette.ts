import __ColorPalette = require('dijit/ColorPalette');
import DijitWidget = require('./DijitWidget');

class ColorPalette extends DijitWidget {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__ColorPalette);
		this._setDijitFields('palette');
		super(kwArgs);
	}
}

export = ColorPalette;

import __ColorPalette = require('dijit/ColorPalette');
import Dijit = require('./Dijit');

class ColorPalette extends Dijit {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__ColorPalette);
		this._setDijitFields('palette');
		super(kwArgs);
	}
}

export = ColorPalette;

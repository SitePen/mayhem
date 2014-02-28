import _DijitCtor = require('dijit/ColorPalette');
import Dijit = require('./Dijit');

class ColorPalette extends Dijit {
}

ColorPalette.prototype._DijitCtor = _DijitCtor;
ColorPalette.prototype._dijitFields = [ 'palette' ];

export = ColorPalette;

import _DijitWidget = require('dijit/ColorPalette');
import _Widget = require('./_Widget');

class ColorPalette extends _Widget {
	static _dijitConfig:any = {
		palette: 'string'
	};
	static _DijitWidget:typeof _DijitWidget = _DijitWidget;
}

ColorPalette.configure(_Widget);

export = ColorPalette;

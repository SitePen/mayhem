import __BorderContainer = require('dijit/layout/BorderContainer');
import LayoutContainer = require('./LayoutContainer');
import PlacePosition = require('../../PlacePosition');
import ui = require('../../interfaces');

class BorderContainer extends LayoutContainer {
	constructor(kwArgs:Object = {}) {
		this._setDijitCtor(__BorderContainer);
		this._setDijitFields('gutters', 'liveSplitters', 'persist'); // TODO
		super(kwArgs);
	}

	add(widget:ui.IDomWidget, position:any = PlacePosition.LAST):IHandle {
		return super.add(widget, position);
	}
}

export = BorderContainer;

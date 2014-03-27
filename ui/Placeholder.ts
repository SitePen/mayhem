/// <amd-dependency path="./renderer!Placeholder" />

import Container = require('./Container');
import has = require('../has');
import PlacePosition = require('./PlacePosition');
import ui = require('./interfaces');

var Renderer:any = require('./renderer!Placeholder');

class Placeholder extends Container implements ui.IPlaceholder {
	/* protected */ _values:ui.IPlaceholderValues;

	get:ui.IPlaceholderGet;
	set:ui.IPlaceholderSet;

	add(child:ui.IWidget, position?:any):IHandle {
		if (has('debug') && position && position !== PlacePosition.ONLY) {
			throw new Error('Placeholder can only have a single child');
		}
		return super.add(child, position);
	}

	/* protected */ _childGetter():ui.IWidget {
		return this.getChild(0);
	}

	/* protected */ _childSetter(child:ui.IWidget):void {
		this.add(child, PlacePosition.ONLY);
	}
}

Placeholder.prototype._renderer = new Renderer();

export = Placeholder;

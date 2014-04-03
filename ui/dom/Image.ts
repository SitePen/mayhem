import dom = require('./interfaces');
import ElementRenderer = require('./_Element');
import touch = require('dojo/touch');
import util = require('../../util');

class ImageRenderer extends ElementRenderer {
	render(widget:dom.IImage):void {
		super.render(widget);

		// TODO: something like srcset?
		this._bindAttribute(widget, 'src');

		// TODO: make this suck less
		touch.press(widget._firstNode, (event:Event) => {
			widget.emit('press', event);
		});
	}
}

ImageRenderer.prototype.elementType = 'img';

export = ImageRenderer;

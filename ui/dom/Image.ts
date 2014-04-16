import dom = require('./interfaces');
import _ElementRenderer = require('./_Element');
import roles = require('./roles');
import touch = require('dojo/touch');
import util = require('../../util');

class ImageRenderer extends _ElementRenderer {
	_buttonActions:any = roles.button;
	_checkboxActions:any = roles.checkbox;
	_dialogActions:any = roles.dialog;
	_radioAction:any = roles.radio;

	render(widget:dom.IImage):void {
		super.render(widget);

		this._bindAttribute(widget, 'src');
	}
}

ImageRenderer.prototype.tagName = 'img';

export = ImageRenderer;

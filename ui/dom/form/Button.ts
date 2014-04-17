import form = require('./interfaces');
import roles = require('../roles');
import TextRenderer = require('../Text');
import util = require('../../../util');

class ButtonRenderer extends TextRenderer {
	_buttonActions:any = roles.button;
	_checkboxActions:any = roles.checkbox;
	_linkActions:any = roles.link;
	_radioAction:any = roles.radio;
}

ButtonRenderer.prototype.tagName = 'button';

export = ButtonRenderer;

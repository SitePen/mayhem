import form = require('./interfaces');
import TextRenderer = require('../Text');
import util = require('../../../util');

class ButtonRenderer extends TextRenderer {
}

ButtonRenderer.prototype.elementType = 'button';

export = ButtonRenderer;

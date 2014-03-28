import ButtonImpl = require('dijit/form/Button');
import ControlRenderer = require('./Control');

class ButtonRenderer extends ControlRenderer {}

ButtonRenderer.implementation({
	constructor: ButtonImpl
});

export = ButtonRenderer;

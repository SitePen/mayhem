import ButtonImpl = require('dijit/form/Button');
import DijitRenderer = require('../_Dijit');

class ButtonRenderer extends DijitRenderer {}

ButtonRenderer.implementation({
	constructor: ButtonImpl
});

export = ButtonRenderer;

import Control = require('./Control');
import ButtonImpl = require('dijit/form/Button');

class Button extends Control {}

Button.implementation({
	constructor: ButtonImpl
});

export = Button;

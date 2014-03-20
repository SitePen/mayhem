import Control = require('./Control');
import DijitCtor = require('dijit/form/Button');

class Button extends Control {
}

Button.prototype.DijitCtor = DijitCtor;

export = Button;

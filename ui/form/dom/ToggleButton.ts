import Button = require('./Button');
import DijitCtor = require('dijit/form/ToggleButton');

class ToggleButton extends Button {
}

ToggleButton.prototype.DijitCtor = DijitCtor;

export = ToggleButton;

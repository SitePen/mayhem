import Button = require('./Button');
import _DijitCtor = require('dijit/form/ToggleButton');

class ToggleButton extends Button {
}

ToggleButton.prototype._DijitCtor = _DijitCtor;
ToggleButton.prototype._dijitFields = [ 'checked' ];

export = ToggleButton;

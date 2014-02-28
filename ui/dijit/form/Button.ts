import Dijit = require('../Dijit');
import _DijitCtor = require('dijit/form/Button');

class Button extends Dijit {
}

Button.prototype._DijitCtor = _DijitCtor;
Button.prototype._dijitFields = [ 'name', 'type' ];
Button.prototype._dijitActions = [ 'onClick' ];

export = Button;

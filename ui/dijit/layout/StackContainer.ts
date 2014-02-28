import Dijit = require('../Dijit')
import _DijitCtor = require('dijit/layout/StackContainer');

class StackContainer extends Dijit {
}

StackContainer.prototype._DijitCtor = _DijitCtor;

export = StackContainer;

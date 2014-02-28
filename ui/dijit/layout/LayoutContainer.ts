import Dijit = require('../Dijit')
import _DijitCtor = require('dijit/layout/LayoutContainer');

class LayoutContainer extends Dijit {
}

LayoutContainer.prototype._DijitCtor = _DijitCtor;
LayoutContainer.prototype._dijitFields = [ 'design' ];

export = LayoutContainer;
